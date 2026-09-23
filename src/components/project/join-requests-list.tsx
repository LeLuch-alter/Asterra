"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { respondToJoinRequest } from "@/actions/join-requests";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { timeAgo } from "@/lib/format";
import type { JoinRequestWithProfile } from "@/lib/supabase/queries/social";
import { USER_ROLE_LABELS } from "@/types";
import { useLocale, useT } from "@/lib/i18n/provider";

/** Pending join requests, shown to the project owner on the Team page. */
export function JoinRequestsList({ requests }: { requests: JoinRequestWithProfile[] }) {
  const t = useT();
  const locale = useLocale();
  const [pending, start] = useTransition();

  if (requests.length === 0) return null;

  function respond(id: string, accept: boolean) {
    start(async () => {
      const res = await respondToJoinRequest(id, accept);
      if (!res.ok) toast.error(res.error);
      else toast.success(accept ? t("Member added") : t("Request declined"));
    });
  }

  return (
    <section className="mb-8 rounded-xl border border-primary/30 bg-card">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <p className="eyebrow eyebrow-accent">{t("Join requests")} · {requests.length}</p>
      </header>
      <ul className="divide-y">
        {requests.map((r) => (
          <li key={r.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
            <UserAvatar name={r.profile.full_name} src={r.profile.avatar_url} className="size-10" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <Link href={`/researchers/${r.profile.id}`} className="font-medium hover:underline">
                  {r.profile.full_name}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {r.profile.organization || t(USER_ROLE_LABELS[r.profile.role])} · {timeAgo(r.created_at, locale)}
                </span>
              </div>
              {r.message && <p className="mt-1 text-sm text-muted-foreground">“{r.message}”</p>}
            </div>
            <div className="flex shrink-0 gap-1">
              <Button size="sm" disabled={pending} onClick={() => respond(r.id, true)}>
                {pending ? <Loader2 className="animate-spin" /> : <Check />}
                {t("Accept")}
              </Button>
              <Button size="sm" variant="ghost" disabled={pending} onClick={() => respond(r.id, false)}>
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
