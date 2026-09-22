import { ResearchGraphView } from "@/components/graph/research-graph";
import { getProjectContext } from "@/lib/supabase/queries/project-context";
import { buildResearchGraph } from "@/lib/supabase/queries/graph";

export default async function GraphPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { project } = await getProjectContext(id);
  const graph = await buildResearchGraph(project);

  return (
    <div className="grid gap-4">
      <div>
        <p className="eyebrow eyebrow-accent mb-1">Research graph</p>
        <p className="max-w-2xl text-sm text-muted-foreground">
          The map of this research: what it asks, how it is tested, who contributes, which sources support which part,
          and where the idea branched.
        </p>
      </div>
      <ResearchGraphView graph={graph} projectId={id} />
    </div>
  );
}
