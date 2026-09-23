"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Clock, X } from "lucide-react";
import { toast } from "sonner";
import { cancelInvitation } from "@/actions/invitations";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { timeAgo } from "@/lib/format";
import type { InvitationWithProfile } from "@/lib/supabase/queries/social";
import { MEMBER_ROLE_LABELS } from "@/types";
import { useLocale, useT } from "@/lib/i18n/provider";

/** Invitations the owner has sent that are still waiting for an answer. */
export function PendingInvitationsList({ invitations, projectId }: { invitations: InvitationWithProfile[]; projectId: string }) {
  const t = useT();
  const locale = useLocale();
  const [pending, start] = useTransition();
  if (invitations.length === 0) return null;

  return (
    <section className="mb-8 rounded-xl border bg-card">
      <header className="border-b px-4 py-3">
        <p className="eyebrow flex items-center gap-2">
          <Clock className="size-3.5" /> {t("Invited · waiting for reply")} · {invitations.length}
        </p>
      </header>
      <ul className="divide-y">
        {invitations.map((i) => (
          <li key={i.id} className="flex items-center gap-3 p-4">
            <UserAvatar name={i.profile.full_name} src={i.profile.avatar_url} className="size-9" />
            <div className="min-w-0 flex-1">
              <Link href={`/researchers/${i.profile.id}`} className="text-sm font-medium hover:underline">
                {i.profile.full_name}
              </Link>
              <p className="text-xs text-muted-foreground">
                {t("as {role}", { role: t(MEMBER_ROLE_LABELS[i.role]).toLowerCase() })} · {t("sent {when}", { when: timeAgo(i.created_at, locale) })}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await cancelInvitation(i.id, projectId);
                  if (!res.ok) toast.error(res.error);
                  else toast.success(t("Invitation withdrawn"));
                })
              }
            >
              <X />
              {t("Withdraw")}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
