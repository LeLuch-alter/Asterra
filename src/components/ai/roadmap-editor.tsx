"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, Loader2, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { addRoadmapItem, deleteRoadmapItem, reorderRoadmap, saveRoadmap, updateRoadmapItem } from "@/actions/roadmap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AiDisclaimer } from "@/components/shared/ai-disclaimer";
import { NativeSelect } from "@/components/shared/native-select";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { RoadmapItem, RoadmapStatus } from "@/types";

type Draft = { title: string; description: string };

const STATUS_LABEL: Record<RoadmapStatus, string> = { todo: "To do", in_progress: "In progress", done: "Done" };

type Props = { projectId: string; items: RoadmapItem[]; canEdit: boolean; aiConfigured: boolean };

export function RoadmapEditor({ projectId, items, canEdit, aiConfigured }: Props) {
  const t = useT();
  const router = useRouter();
  const [draft, setDraft] = useState<Draft[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [pending, start] = useTransition();

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = (await res.json()) as { steps?: Draft[]; error?: string };
      if (!res.ok || !data.steps) throw new Error(data.error ?? t("Generation failed"));
      setDraft(data.steps);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("Generation failed"));
    } finally {
      setGenerating(false);
    }
  }

  function saveDraft() {
    if (!draft) return;
    if (items.length > 0 && !confirm(t("This will replace the current roadmap. Continue?"))) return;
    start(async () => {
      const res = await saveRoadmap(projectId, draft);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(t("Roadmap saved"));
      setDraft(null);
      router.refresh();
    });
  }

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, success?: string) {
    start(async () => {
      const res = await fn();
      if (!res.ok) {
        toast.error(res.error ?? t("Something went wrong"));
        return;
      }
      if (success) toast.success(success);
      router.refresh();
    });
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    run(() => reorderRoadmap(projectId, next.map((i) => i.id)));
  }

  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <div className="grid gap-6">
      {canEdit && (
        <Card>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{t("Generate a roadmap with AI")}</p>
              <p className="text-sm text-muted-foreground">
                {t("Uses the project description, question and hypothesis. You review and edit everything before saving.")}
              </p>
            </div>
            <Button onClick={generate} disabled={generating || !aiConfigured} title={aiConfigured ? undefined : t("AI_API_KEY is not configured")}>
              {generating ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {generating ? t("Generating…") : items.length ? t("Regenerate") : t("Generate roadmap")}
            </Button>
          </CardContent>
        </Card>
      )}

      {draft && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> {t("AI draft — edit, then save")}
            </CardTitle>
            <AiDisclaimer />
          </CardHeader>
          <CardContent className="grid gap-3">
            {draft.map((step, i) => (
              <div key={i} className="grid gap-2 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 text-center text-xs font-semibold text-muted-foreground">{i + 1}</span>
                  <Input
                    value={step.title}
                    onChange={(e) => setDraft(draft.map((s, j) => (j === i ? { ...s, title: e.target.value } : s)))}
                  />
                  <Button variant="ghost" size="icon" aria-label={t("Remove step")} onClick={() => setDraft(draft.filter((_, j) => j !== i))}>
                    <X />
                  </Button>
                </div>
                <Textarea
                  rows={2}
                  value={step.description}
                  className="ml-8 w-auto"
                  onChange={(e) => setDraft(draft.map((s, j) => (j === i ? { ...s, description: e.target.value } : s)))}
                />
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDraft(null)}>
                {t("Discard")}
              </Button>
              <Button onClick={saveDraft} disabled={pending || draft.length === 0}>
                {pending && <Loader2 className="animate-spin" />}
                {t("Save roadmap")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">
            {t("Steps")}{" "}
            {items.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                · {t("{done}/{total} done", { done: doneCount, total: items.length })}
              </span>
            )}
          </h2>
          {canEdit && <AddStepButton projectId={projectId} onDone={() => router.refresh()} />}
        </div>

        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            {t("No roadmap yet.")} {canEdit ? t("Generate one with AI or add steps manually.") : ""}
          </p>
        ) : (
          <ol className="grid gap-3">
            {items.map((item, i) => (
              <RoadmapRow
                key={item.id}
                item={item}
                index={i}
                total={items.length}
                canEdit={canEdit}
                pending={pending}
                onMove={(dir) => move(i, dir)}
                onStatus={(status) => run(() => updateRoadmapItem(item.id, projectId, { status }))}
                onSave={(data) => run(() => updateRoadmapItem(item.id, projectId, data), t("Step updated"))}
                onDelete={() => run(() => deleteRoadmapItem(item.id, projectId), t("Step deleted"))}
              />
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

type RowProps = {
  item: RoadmapItem;
  index: number;
  total: number;
  canEdit: boolean;
  pending: boolean;
  onMove: (dir: -1 | 1) => void;
  onStatus: (status: RoadmapStatus) => void;
  onSave: (data: Draft) => void;
  onDelete: () => void;
};

function RoadmapRow({ item, index, total, canEdit, pending, onMove, onStatus, onSave, onDelete }: RowProps) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const done = item.status === "done";

  return (
    <li className={cn("flex gap-3 rounded-xl border bg-card p-4", done && "opacity-70")}>
      <button
        type="button"
        disabled={!canEdit || pending}
        onClick={() => onStatus(done ? "todo" : "done")}
        aria-label={done ? t("Mark as not done") : t("Mark as done")}
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
          done ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground",
        )}
      >
        {done ? <Check className="size-3.5" /> : index + 1}
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="grid gap-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={pending || !title.trim()}
                onClick={() => {
                  onSave({ title: title.trim(), description: description.trim() });
                  setEditing(false);
                }}
              >
                {t("Save")}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                {t("Cancel")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className={cn("font-medium", done && "line-through")}>{item.title}</p>
            {item.description && <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{item.description}</p>}
          </>
        )}
      </div>

      {canEdit && !editing && (
        <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-start">
          <NativeSelect
            value={item.status}
            onChange={(e) => onStatus(e.target.value as RoadmapStatus)}
            className="h-8 w-32 text-xs"
            aria-label={t("Status")}
          >
            {Object.entries(STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {t(l)}
              </option>
            ))}
          </NativeSelect>
          <div className="flex">
            <Button variant="ghost" size="icon" className="size-8" disabled={pending || index === 0} onClick={() => onMove(-1)} aria-label={t("Move up")}>
              <ArrowUp />
            </Button>
            <Button variant="ghost" size="icon" className="size-8" disabled={pending || index === total - 1} onClick={() => onMove(1)} aria-label={t("Move down")}>
              <ArrowDown />
            </Button>
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setEditing(true)} aria-label={t("Edit")}>
              <Pencil />
            </Button>
            <Button variant="ghost" size="icon" className="size-8" disabled={pending} onClick={onDelete} aria-label={t("Delete")}>
              <Trash2 />
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

function AddStepButton({ projectId, onDone }: { projectId: string; onDone: () => void }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus />
        {t("Add step")}
      </Button>
    );
  }

  return (
    <div className="grid w-full gap-2 rounded-lg border p-3 sm:max-w-md">
      <Input placeholder={t("Step title")} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      <Textarea placeholder={t("Description (optional)")} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={pending || !title.trim()}
          onClick={() =>
            start(async () => {
              const res = await addRoadmapItem(projectId, { title: title.trim(), description: description.trim(), status: "todo" });
              if (!res.ok) {
                toast.error(res.error);
                return;
              }
              setTitle("");
              setDescription("");
              setOpen(false);
              onDone();
            })
          }
        >
          {pending && <Loader2 className="animate-spin" />}
          {t("Add")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          {t("Cancel")}
        </Button>
      </div>
    </div>
  );
}
