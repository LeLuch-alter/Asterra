import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddMemberDialog } from "@/components/project/add-member-dialog";
import { MemberList } from "@/components/project/member-list";
import { getProjectContext } from "@/lib/supabase/queries/project-context";
import { getProjectMembers } from "@/lib/supabase/queries/projects";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, isOwner, isMember } = await getProjectContext(id);
  const members = await getProjectMembers(id);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
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
          Only the project owner can add members. Complete your profile so AI Match can recommend you.
        </p>
      )}
    </div>
  );
}
