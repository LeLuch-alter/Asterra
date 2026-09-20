import { redirect } from "next/navigation";
import { MatchPanel } from "@/components/ai/match-panel";
import { serverEnv } from "@/lib/env";
import { getProjectContext } from "@/lib/supabase/queries/project-context";
import { getProjectMembers } from "@/lib/supabase/queries/projects";
import { getConnectionStates } from "@/lib/supabase/queries/social";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, isMember, isOwner } = await getProjectContext(id);
  if (!isMember) redirect(`/projects/${id}`);
  const [members, connections] = await Promise.all([getProjectMembers(id), getConnectionStates(user.id, [])]);

  return (
    <div className="mx-auto max-w-3xl">
      <MatchPanel
        projectId={id}
        isOwner={isOwner}
        memberIds={members.map((m) => m.user_id)}
        connections={connections}
        aiConfigured={serverEnv.aiConfigured}
      />
    </div>
  );
}
