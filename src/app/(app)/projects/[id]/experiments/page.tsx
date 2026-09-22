import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ExperimentDialog } from "@/components/graph/experiment-dialog";
import { DeleteExperimentButton } from "@/components/graph/delete-experiment-button";
import { getProjectContext } from "@/lib/supabase/queries/project-context";
import { getExperiments } from "@/lib/supabase/queries/graph";
import { getResults } from "@/lib/supabase/queries/results";
import { formatDate } from "@/lib/format";
import { EXPERIMENT_STATUS_LABELS } from "@/types";

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{value}</p>
    </div>
  );
}

export default async function ExperimentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, isMember, isOwner } = await getProjectContext(id);
  const [experiments, results] = await Promise.all([getExperiments(id), getResults(id)]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="eyebrow eyebrow-accent">Experiments</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Each experiment links the methodology to the results it produced.
          </p>
        </div>
        {isMember && <ExperimentDialog projectId={id} />}
      </div>

      {experiments.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No experiments yet"
          description={
            isMember
              ? "Add the first experiment: what it tests, how, on which data, and what came out."
              : "The team has not published any experiments yet."
          }
          action={isMember ? <ExperimentDialog projectId={id} /> : undefined}
        />
      ) : (
        <ol className="grid gap-4">
          {experiments.map((e, i) => {
            const linked = results.filter((r) => r.experiment_id === e.id);
            const canEdit = isOwner || e.author_id === user.id;
            return (
              <li key={e.id} className="rounded-xl border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="eyebrow">Experiment #{i + 1}</p>
                    <h3 className="mt-1 text-lg font-semibold leading-snug">{e.title}</h3>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <UserAvatar name={e.author.full_name} src={e.author.avatar_url} className="size-5" />
                      {e.author.full_name} · {formatDate(e.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={e.status === "done" ? "default" : "outline"}>{EXPERIMENT_STATUS_LABELS[e.status]}</Badge>
                    {canEdit && (
                      <>
                        <ExperimentDialog
                          projectId={id}
                          experiment={e}
                          trigger={
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          }
                        />
                        <DeleteExperimentButton experimentId={e.id} projectId={id} />
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Purpose" value={e.purpose} />
                  <Field label="Methodology" value={e.methodology} />
                  <Field label="Input / data" value={e.data_description} />
                  <Field label="Outcome" value={e.outcome} />
                </div>

                <div className="mt-4 border-t pt-3">
                  <p className="eyebrow mb-1">Results from this experiment · {linked.length}</p>
                  {linked.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      None yet.{" "}
                      {isMember && (
                        <Link href={`/projects/${id}/results`} className="text-foreground underline-offset-4 hover:underline">
                          Add a result and link it here
                        </Link>
                      )}
                    </p>
                  ) : (
                    <ul className="grid gap-1">
                      {linked.map((r) => (
                        <li key={r.id}>
                          <Link href={`/projects/${id}/results`} className="text-sm hover:underline">
                            {r.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
