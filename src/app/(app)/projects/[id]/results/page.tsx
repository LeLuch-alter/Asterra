import { FileText } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ResultCard } from "@/components/project/result-card";
import { ResultFormDialog } from "@/components/project/result-form-dialog";
import { getProjectContext } from "@/lib/supabase/queries/project-context";
import { getResults } from "@/lib/supabase/queries/results";
import { getExperiments } from "@/lib/supabase/queries/graph";
import { getT } from "@/lib/i18n/server";

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, isMember, isOwner } = await getProjectContext(id);
  const [results, experiments] = await Promise.all([getResults(id), getExperiments(id)]);
  const experimentOptions = experiments.map((e) => ({ id: e.id, title: e.title }));
  const t = await getT();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {t(results.length === 1 ? "{count} result" : "{count} results", { count: results.length })}
        </p>
        {isMember && <ResultFormDialog projectId={id} experiments={experimentOptions} />}
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t("No research results yet")}
          description={
            isMember
              ? t("Add notes, findings or draft sections. Every member of the team can contribute.")
              : t("The team has not published any results yet.")
          }
          action={isMember ? <ResultFormDialog projectId={id} experiments={experimentOptions} /> : undefined}
        />
      ) : (
        <div className="grid gap-4">
          {results.map((r) => (
            <ResultCard
              key={r.id}
              result={r}
              isMember={isMember}
              canEdit={isOwner || r.author_id === user.id}
              experiments={experimentOptions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
