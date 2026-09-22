"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { segment: "", label: "Overview" },
  { segment: "graph", label: "Graph" },
  { segment: "timeline", label: "Timeline" },
  { segment: "roadmap", label: "Roadmap" },
  { segment: "experiments", label: "Experiments" },
  { segment: "results", label: "Results" },
  { segment: "sources", label: "Sources" },
  { segment: "team", label: "Team" },
  { segment: "match", label: "AI Match", members: true },
  { segment: "assistant", label: "AI Assistant", members: true },
];

export function ProjectNav({ projectId, isMember }: { projectId: string; isMember: boolean }) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;
  return (
    <nav className="-mb-px flex gap-1 overflow-x-auto border-b">
      {TABS.filter((t) => !t.members || isMember).map((t) => {
        const href = t.segment ? `${base}/${t.segment}` : base;
        const active = pathname === href;
        return (
          <Link
            key={t.segment}
            href={href}
            className={cn(
              "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
