import { ResearchTimeline } from "@/components/graph/research-timeline";
import { getProjectContext } from "@/lib/supabase/queries/project-context";
import { getActivity, getVersions } from "@/lib/supabase/queries/graph";

export default async function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await getProjectContext(id);
  const [activity, versions] = await Promise.all([getActivity(id), getVersions(id)]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="eyebrow eyebrow-accent mb-1">Research timeline</p>
        <p className="text-sm text-muted-foreground">
          How this research developed: people joining, ideas changing, experiments and results appearing.
        </p>
      </div>
      <ResearchTimeline activity={activity} versions={versions} />
    </div>
  );
}
