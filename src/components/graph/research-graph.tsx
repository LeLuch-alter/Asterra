"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ArrowUpRight, Maximize2, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { GraphEdge, GraphNode, GraphNodeKind, ResearchGraph } from "@/lib/supabase/queries/graph";

/** Visual identity of each node kind: flat colour + short legend label. */
const KIND_STYLE: Record<GraphNodeKind, { fill: string; stroke: string; text: string; legend: string }> = {
  project: { fill: "fill-primary", stroke: "stroke-primary", text: "fill-primary-foreground", legend: "Project" },
  question: { fill: "fill-card", stroke: "stroke-primary", text: "fill-foreground", legend: "Question" },
  hypothesis: { fill: "fill-card", stroke: "stroke-primary", text: "fill-foreground", legend: "Hypothesis" },
  methodology: { fill: "fill-card", stroke: "stroke-primary", text: "fill-foreground", legend: "Methodology" },
  roadmap: { fill: "fill-card", stroke: "stroke-border", text: "fill-foreground", legend: "Roadmap step" },
  experiment: { fill: "fill-accent", stroke: "stroke-accent-foreground/40", text: "fill-accent-foreground", legend: "Experiment" },
  result: { fill: "fill-card", stroke: "stroke-chart-2", text: "fill-foreground", legend: "Result" },
  person: { fill: "fill-card", stroke: "stroke-chart-4", text: "fill-foreground", legend: "Researcher" },
  source: { fill: "fill-card", stroke: "stroke-chart-5", text: "fill-foreground", legend: "Source" },
  fork: { fill: "fill-card", stroke: "stroke-chart-3", text: "fill-foreground", legend: "Fork" },
  related: { fill: "fill-muted", stroke: "stroke-border", text: "fill-muted-foreground", legend: "Related" },
};

const SPINE: GraphNodeKind[] = ["project", "question", "hypothesis", "methodology"];

type Placed = GraphNode & { x: number; y: number; w: number; h: number };

/**
 * Deterministic layout: a vertical "idea spine" in the middle, experiments and
 * results below it, people on the left, sources on the right, forks and related
 * research above. No physics simulation — the map looks the same on every load.
 */
function layout(graph: ResearchGraph): Placed[] {
  const placed: Placed[] = [];
  const byKind = (k: GraphNodeKind) => graph.nodes.filter((n) => n.kind === k);
  const put = (n: GraphNode, x: number, y: number, w = 186, h = 52) => placed.push({ ...n, x, y, w, h });

  // Spine
  SPINE.forEach((kind, i) => {
    const node = graph.nodes.find((n) => n.kind === kind);
    if (node) put(node, 0, i * 168, kind === "project" ? 250 : 210, kind === "project" ? 64 : 56);
  });

  const spread = (count: number, gap: number) => (i: number) => (i - (count - 1) / 2) * gap;

  // Experiments and results below the methodology
  const experiments = byKind("experiment");
  const expX = spread(experiments.length, 244);
  experiments.forEach((n, i) => put(n, expX(i), 700, 210, 56));

  const results = byKind("result");
  const resX = spread(results.length, 244);
  results.forEach((n, i) => put(n, resX(i), 868, 210, 56));

  // People on the left
  const people = byKind("person");
  people.forEach((n, i) => put(n, -520, 40 + i * 92, 190, 52));

  // Roadmap steps under the people column
  const roadmap = byKind("roadmap");
  roadmap.slice(0, 10).forEach((n, i) => put(n, -520, 40 + people.length * 92 + 60 + i * 74, 190, 48));

  // Sources on the right
  const sources = byKind("source");
  sources.forEach((n, i) => put(n, 520, 40 + i * 92, 200, 52));

  // Forks and related research above the project
  const above = [...byKind("fork"), ...byKind("related")];
  const aboveX = spread(above.length, 236);
  above.forEach((n, i) => put(n, aboveX(i), -190, 206, 50));

  return placed;
}

/** Cubic curve between two node borders — softer than straight lines. */
function edgePath(a: Placed, b: Placed) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const vertical = Math.abs(dy) >= Math.abs(dx);
  const x1 = a.x + (vertical ? 0 : Math.sign(dx) * (a.w / 2));
  const y1 = a.y + (vertical ? Math.sign(dy) * (a.h / 2) : 0);
  const x2 = b.x - (vertical ? 0 : Math.sign(dx) * (b.w / 2));
  const y2 = b.y - (vertical ? Math.sign(dy) * (b.h / 2) : 0);
  const c = vertical ? [x1, (y1 + y2) / 2, x2, (y1 + y2) / 2] : [(x1 + x2) / 2, y1, (x1 + x2) / 2, y2];
  return `M ${x1} ${y1} C ${c[0]} ${c[1]}, ${c[2]} ${c[3]}, ${x2} ${y2}`;
}

export function ResearchGraphView({ graph, projectId }: { graph: ResearchGraph; projectId: string }) {
  const t = useT();
  const nodes = useMemo(() => layout(graph), [graph]);
  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const [selectedId, setSelectedId] = useState<string>("project");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const selected = selectedId ? nodeById.get(selectedId) : undefined;
  const connected = useMemo(() => {
    const ids = new Set<string>();
    if (!selectedId) return ids;
    for (const e of graph.edges) {
      if (e.from === selectedId) ids.add(e.to);
      if (e.to === selectedId) ids.add(e.from);
    }
    return ids;
  }, [graph.edges, selectedId]);

  // World bounds → viewBox, so the whole map fits by default.
  const bounds = useMemo(() => {
    const pad = 90;
    const xs = nodes.flatMap((n) => [n.x - n.w / 2, n.x + n.w / 2]);
    const ys = nodes.flatMap((n) => [n.y - n.h / 2, n.y + n.h / 2]);
    const minX = Math.min(...xs, -300) - pad;
    const maxX = Math.max(...xs, 300) + pad;
    const minY = Math.min(...ys, -200) - pad;
    const maxY = Math.max(...ys, 600) + pad;
    return { minX, minY, width: maxX - minX, height: maxY - minY };
  }, [nodes]);

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }
  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!drag.current) return;
    setPan({
      x: drag.current.panX + (e.clientX - drag.current.x) / zoom,
      y: drag.current.panY + (e.clientY - drag.current.y) / zoom,
    });
  }
  const endDrag = () => (drag.current = null);

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.min(2.4, Math.max(0.35, z * (e.deltaY < 0 ? 1.12 : 0.89))));
  }

  const reset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const usedKinds = Array.from(new Set(graph.nodes.map((n) => n.kind)));

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="relative overflow-hidden rounded-xl border bg-card">
        <svg
          viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
          className="h-[560px] w-full cursor-grab touch-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onWheel={onWheel}
          role="img"
          aria-label={t("Research graph")}
        >
          <g
            transform={`translate(${bounds.minX + bounds.width / 2} ${bounds.minY + bounds.height / 2}) scale(${zoom}) translate(${
              -(bounds.minX + bounds.width / 2) + pan.x
            } ${-(bounds.minY + bounds.height / 2) + pan.y})`}
          >
            {/* Edges */}
            {graph.edges.map((e: GraphEdge, i) => {
              const a = nodeById.get(e.from);
              const b = nodeById.get(e.to);
              if (!a || !b) return null;
              const active = selectedId === e.from || selectedId === e.to;
              return (
                <g key={i}>
                  <path
                    d={edgePath(a, b)}
                    className={cn("fill-none transition-[stroke-opacity]", active ? "stroke-primary" : "stroke-foreground")}
                    strokeWidth={active ? 1.6 : 1}
                    strokeOpacity={active ? 0.9 : 0.18}
                  />
                  {active && e.label && (
                    <text
                      x={(a.x + b.x) / 2}
                      y={(a.y + b.y) / 2 - 6}
                      textAnchor="middle"
                      className="fill-muted-foreground"
                      style={{ font: "10px var(--font-mono-face)", letterSpacing: "0.08em" }}
                    >
                      {t(e.label)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((n) => {
              const style = KIND_STYLE[n.kind];
              const isSelected = n.id === selectedId;
              const dim = Boolean(selectedId) && !isSelected && !connected.has(n.id);
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x} ${n.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(n.id);
                  }}
                  className="cursor-pointer"
                  opacity={dim ? 0.38 : 1}
                >
                  <rect
                    x={-n.w / 2}
                    y={-n.h / 2}
                    width={n.w}
                    height={n.h}
                    rx={n.kind === "person" ? n.h / 2 : 10}
                    className={cn(style.fill, style.stroke)}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  <text
                    x={0}
                    y={n.meta ? -3 : 4}
                    textAnchor="middle"
                    className={cn(style.text, "pointer-events-none")}
                    style={{ font: "500 13px var(--font-body)" }}
                  >
                    {n.label}
                  </text>
                  {n.meta && (
                    <text
                      x={0}
                      y={13}
                      textAnchor="middle"
                      className={cn(n.kind === "project" ? style.text : "fill-muted-foreground", "pointer-events-none")}
                      style={{ font: "10px var(--font-mono-face)", letterSpacing: "0.04em" }}
                    >
                      {n.meta.length > 34 ? `${n.meta.slice(0, 33)}…` : n.meta}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => setZoom((z) => Math.min(2.4, z * 1.2))} aria-label={t("Zoom in")}>
            <Plus />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => setZoom((z) => Math.max(0.35, z * 0.83))} aria-label={t("Zoom out")}>
            <Minus />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={reset} aria-label={t("Reset view")}>
            <Maximize2 />
          </Button>
        </div>

        <p className="eyebrow absolute bottom-3 left-4">{t("Drag to move · scroll to zoom · click a node")}</p>
      </div>

      {/* Detail panel */}
      <aside className="grid content-start gap-4">
        <div className="rounded-xl border bg-card p-4">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <p className="eyebrow eyebrow-accent">{t(KIND_STYLE[selected.kind].legend)}</p>
                <button onClick={() => setSelectedId("")} aria-label={t("Clear selection")} className="text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              </div>
              <h3 className="mt-2 font-semibold leading-snug">{selected.label}</h3>
              {selected.meta && <p className="mt-1 text-xs text-muted-foreground">{selected.meta}</p>}
              {selected.body && <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{selected.body}</p>}
              {selected.details?.map((d) => (
                <div key={d.label} className="mt-3">
                  <p className="eyebrow">{t(d.label)}</p>
                  <p className="mt-0.5 whitespace-pre-line text-sm text-muted-foreground">{d.value}</p>
                </div>
              ))}
              {selected.href && (
                <Button asChild variant="outline" size="sm" className="mt-4">
                  {selected.href.startsWith("http") ? (
                    <a href={selected.href} target="_blank" rel="noreferrer">
                      {t("Open source")} <ArrowUpRight />
                    </a>
                  ) : (
                    <Link href={selected.href}>
                      {t("Open")} <ArrowUpRight />
                    </Link>
                  )}
                </Button>
              )}
              {connected.size > 0 && (
                <div className="mt-4 border-t pt-3">
                  <p className="eyebrow mb-2">{t("Connected")} · {connected.size}</p>
                  <ul className="grid gap-1">
                    {Array.from(connected)
                      .map((id) => nodeById.get(id))
                      .filter(Boolean)
                      .slice(0, 8)
                      .map((n) => (
                        <li key={n!.id}>
                          <button
                            onClick={() => setSelectedId(n!.id)}
                            className="w-full truncate text-left text-sm text-muted-foreground hover:text-foreground"
                          >
                            {t(KIND_STYLE[n!.kind].legend)}: {n!.label}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("Click any node on the map to see what it holds and how it connects to the rest of the research.")}
            </p>
          )}
        </div>

        <div className="rounded-xl border bg-card p-4">
          <p className="eyebrow mb-3">{t("Legend")}</p>
          <ul className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {usedKinds.map((k) => (
              <li key={k} className="flex items-center gap-2">
                <span className={cn("size-2.5 rounded-full border", KIND_STYLE[k].stroke.replace("stroke-", "border-"))} />
                {t(KIND_STYLE[k].legend)}
              </li>
            ))}
          </ul>
          <Button asChild variant="ghost" size="sm" className="mt-3 w-full justify-start">
            <Link href={`/projects/${projectId}/timeline`}>{t("See how it evolved →")}</Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}
