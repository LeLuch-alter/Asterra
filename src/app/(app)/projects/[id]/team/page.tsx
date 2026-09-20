import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddMemberDialog } from "@/components/project/add-member-dialog";
import { MemberList } from "@/components/project/member-list";
import { JoinRequestsList } from "@/components/project/join-requests-list";
import { getProjectContext } from "@/lib/supabase/queries/project-context";
import { getProjectMembers } from "@/lib/supabase/queries/projects";
import { getPendingJoinRequests } from "@/lib/supabase/queries/social";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, isOwner, isMember } = await getProjectContext(id);
  const [members, requests] = await Promise.all([getProjectMembers(id), isOwner ? getPendingJoinRequests(id) : Promise.resolve([])]);

  return (
    <div className="mx-auto max-w-3xl">
      {isOwner && <JoinRequestsList requests={requests} />}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">
          {members.length} {members.length === 1 ? "member" : "members"}
        </p>
        {isOwner && (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/projects/${id}/match`}>
                <Sparkles />
                AI Match
              </Link>
            </Button>
            <AddMemberDialog projectId={id} existingIds={members.map((m) => m.user_id)} />
          </div>
        )}
      </div>
      <MemberList projectId={id} members={members} currentUserId={user.id} isOwner={isOwner} />
      {!isMember && (
        <p className="mt-4 text-sm text-muted-foreground">
          Want to work on this? Use “Request to join” at the top — the owner will see your request here.
        </p>
      )}
    </div>
  );
}
