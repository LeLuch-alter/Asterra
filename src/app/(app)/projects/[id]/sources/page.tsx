import Link from "next/link";
import { ExternalLink, Library } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { SourceDialog, type SourceTargetOption } from "@/components/graph/source-dialog";
import { DeleteSourceButton } from "@/components/graph/delete-source-button";
import { getProjectContext } from "@/lib/supabase/queries/project-context";
import { getExperiments, getSources } from "@/lib/supabase/queries/graph";
import { getResults } from "@/lib/supabase/queries/results";
import { getRoadmap } from "@/lib/supabase/queries/roadmap";
import { formatDate } from "@/lib/format";
import { SOURCE_TARGET_LABELS } from "@/types";
import { getLocale, getT } from "@/lib/i18n/server";

export default async function SourcesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { isMember } = await getProjectContext(id);
  const [sources, experiments, results, roadmap] = await Promise.all([
    getSources(id),
    getExperiments(id),
    getResults(id),
    getRoadmap(id),
  ]);
  const [t, locale] = await Promise.all([getT(), getLocale()]);

  // Everything a source can be attached to.
  const targets: SourceTargetOption[] = [
    { value: "project", label: t("The project as a whole") },
    { value: "research_question", label: t("Research question") },
    { value: "hypothesis", label: t("Hypothesis") },
    { value: "methodology", label: t("Methodology") },
    ...experiments.map((e) => ({ value: `experiment:${e.id}`, label: `${t("Experiment")} — ${e.title}`, targetId: e.id })),
    ...results.map((r) => ({ value: `result:${r.id}`, label: `${t("Result")} — ${r.title}`, targetId: r.id })),
    ...roadmap.map((r) => ({ value: `roadmap_item:${r.id}`, label: `${t("Roadmap step")} — ${r.title}`, targetId: r.id })),
  ];

  const nameOf = (targetId: string | null) =>
    experiments.find((e) => e.id === targetId)?.title ??
    results.find((r) => r.id === targetId)?.title ??
    roadmap.find((r) => r.id === targetId)?.title ??
    "";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="eyebrow eyebrow-accent">{t("Scientific sources")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("Every source says which part of the research it supports, so evidence stays connected to the idea.")}
          </p>
        </div>
        {isMember && <SourceDialog projectId={id} targets={targets} />}
      </div>

      {sources.length === 0 ? (
        <EmptyState
          icon={Library}
          title={t("No sources yet")}
          description={
            isMember
              ? t("Attach a paper or dataset to the question, hypothesis, methodology, an experiment or a result.")
              : t("The team has not attached any sources yet.")
          }
          action={isMember ? <SourceDialog projectId={id} targets={targets} /> : undefined}
        />
      ) : (
        <ul className="grid gap-3">
          {sources.map((s) => (
            <li key={s.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-medium leading-snug">
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noreferrer" className="hover:underline">
                        {s.title} <ExternalLink className="inline size-3.5" />
                      </a>
                    ) : (
                      s.title
                    )}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[s.authors, s.year, formatDate(s.created_at, undefined, locale)].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline">
                    {t(SOURCE_TARGET_LABELS[s.target_type])}
                    {nameOf(s.target_id) ? `: ${nameOf(s.target_id).slice(0, 24)}` : ""}
                  </Badge>
                  {isMember && <DeleteSourceButton sourceId={s.id} projectId={id} />}
                </div>
              </div>
              {s.note && <p className="mt-2 text-sm text-muted-foreground">{s.note}</p>}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        {t("Sources appear in the")}{" "}
        <Link href={`/projects/${id}/graph`} className="text-foreground underline-offset-4 hover:underline">
          {t("research graph")}
        </Link>{" "}
        {t("next to the part of the research they support.")}
      </p>
    </div>
  );
}
