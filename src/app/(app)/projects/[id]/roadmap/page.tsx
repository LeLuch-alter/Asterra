import { RoadmapEditor } from "@/components/ai/roadmap-editor";
import { AiDisclaimer } from "@/components/shared/ai-disclaimer";
import { serverEnv } from "@/lib/env";
import { getProjectContext } from "@/lib/supabase/queries/project-context";
import { getRoadmap } from "@/lib/supabase/queries/roadmap";

export default async function RoadmapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { isMember } = await getProjectContext(id);
  const items = await getRoadmap(id);

  return (
    <div className="mx-auto max-w-3xl">
      <RoadmapEditor projectId={id} items={items} canEdit={isMember} aiConfigured={serverEnv.aiConfigured} />
      {items.length > 0 && <AiDisclaimer className="mt-6" />}
    </div>
  );
}
