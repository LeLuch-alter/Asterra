"use client";

import Link from "next/link";
import { useTransition } from "react";
import { UserMinus } from "lucide-react";
import { toast } from "sonner";
import { removeMember } from "@/actions/members";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TagList } from "@/components/shared/tag-list";
import { UserAvatar } from "@/components/shared/user-avatar";
import { MEMBER_ROLE_LABELS, type ProjectMemberWithProfile } from "@/types";
import { useT } from "@/lib/i18n/provider";

type Props = {
  projectId: string;
  members: ProjectMemberWithProfile[];
  currentUserId: string;
  isOwner: boolean;
};

export function MemberList({ projectId, members, currentUserId, isOwner }: Props) {
  const t = useT();
  const [pending, start] = useTransition();

  function remove(userId: string) {
    start(async () => {
      const res = await removeMember(projectId, userId);
      if (!res.ok) toast.error(res.error);
      else toast.success(t("Member removed"));
    });
  }

  return (
    <div className="grid gap-3">
      {members.map((m) => {
        const canRemove = m.role !== "owner" && (isOwner || m.user_id === currentUserId);
        return (
          <Card key={m.user_id}>
            <CardContent className="flex items-center gap-4">
              <UserAvatar name={m.profile.full_name} src={m.profile.avatar_url} className="size-10" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/researchers/${m.user_id}`} className="font-medium hover:underline">
                    {m.profile.full_name}
                  </Link>
                  <Badge variant={m.role === "owner" ? "default" : "outline"}>{t(MEMBER_ROLE_LABELS[m.role])}</Badge>
                </div>
                {m.profile.organization && <p className="text-sm text-muted-foreground">{m.profile.organization}</p>}
                {m.profile.skills.length > 0 && (
                  <div className="mt-2">
                    <TagList tags={m.profile.skills} max={5} />
                  </div>
                )}
              </div>
              {canRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={pending}
                  onClick={() => remove(m.user_id)}
                  aria-label={m.user_id === currentUserId ? t("Leave project") : t("Remove member")}
                  title={m.user_id === currentUserId ? t("Leave project") : t("Remove member")}
                >
                  <UserMinus />
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
