"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Check, Loader2, Mail, X } from "lucide-react";
import { toast } from "sonner";
import { respondToInvitation } from "@/actions/invitations";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { timeAgo } from "@/lib/format";
import type { InvitationWithProject } from "@/lib/supabase/queries/social";
import { MEMBER_ROLE_LABELS } from "@/types";
import { useLocale, useT } from "@/lib/i18n/provider";

/** Invitations addressed to the current user, with Accept / Decline. */
export function MyInvitations({ invitations }: { invitations: InvitationWithProject[] }) {
  const t = useT();
  const locale = useLocale();
  const [pending, start] = useTransition();
  if (invitations.length === 0) return null;

  function respond(id: string, accept: boolean, title: string) {
    start(async () => {
      const res = await respondToInvitation(id, accept);
      if (!res.ok) toast.error(res.error);
      else toast.success(accept ? t("You joined “{title}”", { title }) : t("Invitation declined"));
    });
  }

  return (
    <section className="mb-8 rounded-xl border border-primary/30 bg-card">
      <header className="border-b px-4 py-3">
        <p className="eyebrow eyebrow-accent flex items-center gap-2">
          <Mail className="size-3.5" /> {t("Project invitations")} · {invitations.length}
        </p>
      </header>
      <ul className="divide-y">
        {invitations.map((i) => (
          <li key={i.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
            <UserAvatar name={i.inviter.full_name} src={i.inviter.avatar_url} className="size-10" />
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <Link href={`/researchers/${i.inviter.id}`} className="font-medium hover:underline">
                  {i.inviter.full_name}
                </Link>{" "}
                {t("invited you to join")}{" "}
                <Link href={`/projects/${i.project.id}`} className="font-medium hover:underline">
                  {i.project.title}
                </Link>{" "}
                {t("as {role}", { role: t(MEMBER_ROLE_LABELS[i.role]).toLowerCase() })}
              </p>
              <p className="text-xs text-muted-foreground">
                {i.project.research_field} · {timeAgo(i.created_at, locale)}
              </p>
              {i.message && <p className="mt-1 text-sm text-muted-foreground">“{i.message}”</p>}
            </div>
            <div className="flex shrink-0 gap-1">
              <Button size="sm" disabled={pending} onClick={() => respond(i.id, true, i.project.title)}>
                {pending ? <Loader2 className="animate-spin" /> : <Check />}
                {t("Accept")}
              </Button>
              <Button size="sm" variant="ghost" disabled={pending} onClick={() => respond(i.id, false, i.project.title)}>
                <X />
                {t("Decline")}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
