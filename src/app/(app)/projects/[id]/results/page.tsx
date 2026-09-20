import { FileText } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ResultCard } from "@/components/project/result-card";
import { ResultFormDialog } from "@/components/project/result-form-dialog";
import { getProjectContext } from "@/lib/supabase/queries/project-context";
import { getResults } from "@/lib/supabase/queries/results";

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, isMember, isOwner } = await getProjectContext(id);
  const results = await getResults(id);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? "result" : "results"}
        </p>
        {isMember && <ResultFormDialog projectId={id} />}
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No research results yet"
          description={
            isMember
              ? "Add notes, findings or draft sections. Every member of the team can contribute."
              : "The team has not published any results yet."
          }
          action={isMember ? <ResultFormDialog projectId={id} /> : undefined}
        />
      ) : (
        <div className="grid gap-4">
          {results.map((r) => (
            <ResultCard key={r.id} result={r} isMember={isMember} canEdit={isOwner || r.author_id === user.id} />
          ))}
        </div>
      )}
    </div>
  );
}
