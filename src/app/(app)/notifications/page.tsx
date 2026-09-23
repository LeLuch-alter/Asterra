import Link from "next/link";
import type { Metadata } from "next";
import { Bell, CheckCheck } from "lucide-react";
import { markAllRead } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { requireUser } from "@/lib/supabase/server";
import { getNotifications } from "@/lib/supabase/queries/notifications";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { describeNotification } from "@/components/layout/notifications-live";
import { MyInvitations } from "@/components/project/my-invitations";
import { getMyInvitations } from "@/lib/supabase/queries/social";
import { getLocale, getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser();
  const [items, invitations] = await Promise.all([getNotifications(user.id), getMyInvitations(user.id)]);
  const unread = items.filter((n) => !n.read_at).length;
  const [t, locale] = await Promise.all([getT(), getLocale()]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow={t("Activity")}
        title={t("Notifications")}
        description={t("Connection requests, join requests and project activity.")}
        actions={
          unread > 0 ? (
            <form action={markAllRead}>
              <Button type="submit" variant="outline" size="sm">
                <CheckCheck />
                {t("Mark all read")}
              </Button>
            </form>
          ) : undefined
        }
      />
      <MyInvitations invitations={invitations} />
      {items.length === 0 ? (
        <EmptyState icon={Bell} title={t("Nothing here yet")} description={t("You will see activity here when someone connects with you or adds you to a project.")} />
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {items.map((n) => {
            const { text, href } = describeNotification(n, t);
            const body = (
              <span className="flex items-start gap-3 px-4 py-3">
                <span className={cn("mt-2 size-2 shrink-0 rounded-full", n.read_at ? "bg-transparent" : "bg-primary")} />
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm", !n.read_at && "font-medium")}>{text}</span>
                  <span className="block text-xs text-muted-foreground">{timeAgo(n.created_at, locale)}</span>
                </span>
              </span>
            );
            return (
              <li key={n.id} className={cn(!n.read_at && "bg-accent/30")}>
                {href ? (
                  <Link href={href} className="block hover:bg-muted/60">
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
