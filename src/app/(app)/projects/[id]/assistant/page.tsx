import { redirect } from "next/navigation";
import { AssistantPanel } from "@/components/ai/assistant-panel";
import { serverEnv } from "@/lib/env";
import { getProjectContext } from "@/lib/supabase/queries/project-context";
import { getResults } from "@/lib/supabase/queries/results";

export default async function AssistantPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const [{ id }, { result }] = await Promise.all([params, searchParams]);
  const { isMember } = await getProjectContext(id);
  if (!isMember) redirect(`/projects/${id}`);
  const results = await getResults(id);

  return (
    <AssistantPanel
      projectId={id}
      results={results.map((r) => ({ id: r.id, title: r.title }))}
      initialResultId={results.some((r) => r.id === result) ? result : undefined}
      aiConfigured={serverEnv.aiConfigured}
    />
  );
}
