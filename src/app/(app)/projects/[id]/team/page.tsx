import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InviteMemberDialog } from "@/components/project/invite-member-dialog";
import { MemberList } from "@/components/project/member-list";
import { JoinRequestsList } from "@/components/project/join-requests-list";
import { PendingInvitationsList } from "@/components/project/pending-invitations-list";
import { getProjectContext } from "@/lib/supabase/queries/project-context";
import { getProjectMembers } from "@/lib/supabase/queries/projects";
import { getInvitableConnections, getPendingInvitationsForProject, getPendingJoinRequests } from "@/lib/supabase/queries/social";
import { getT } from "@/lib/i18n/server";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, isOwner, isMember } = await getProjectContext(id);
  const [members, requests, invitations, candidates] = await Promise.all([
    getProjectMembers(id),
    isOwner ? getPendingJoinRequests(id) : Promise.resolve([]),
    isOwner ? getPendingInvitationsForProject(id) : Promise.resolve([]),
    isOwner ? getInvitableConnections(user.id, id) : Promise.resolve([]),
  ]);
  const t = await getT();

  return (
    <div className="mx-auto max-w-3xl">
      {isOwner && <JoinRequestsList requests={requests} />}
      {isOwner && <PendingInvitationsList invitations={invitations} projectId={id} />}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">
          {t(members.length === 1 ? "{count} member" : "{count} members", { count: members.length })}
        </p>
        {isOwner && (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/projects/${id}/match`}>
                <Sparkles />
                {t("AI Match")}
              </Link>
            </Button>
            <InviteMemberDialog projectId={id} candidates={candidates} />
          </div>
        )}
      </div>
      <MemberList projectId={id} members={members} currentUserId={user.id} isOwner={isOwner} />
      {isOwner && (
        <p className="mt-4 text-sm text-muted-foreground">
          {t("You can invite people from your connections; they join after accepting. Others can ask to join and you approve them here.")}
        </p>
      )}
      {!isMember && (
        <p className="mt-4 text-sm text-muted-foreground">
          {t("Want to work on this? Use “Request to join” at the top — the owner will see your request here.")}
        </p>
      )}
    </div>
  );
}
