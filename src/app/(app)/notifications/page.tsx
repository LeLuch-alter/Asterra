import Link from "next/link";
import type { Metadata } from "next";
import { Bell, CheckCheck } from "lucide-react";
import { markAllRead } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { getUser } from "@/lib/supabase/server";
import { getNotifications } from "@/lib/supabase/queries/notifications";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types";

export const metadata: Metadata = { title: "Notifications" };

function describe(n: Notification): { text: string; href?: string } {
  const p = (n.payload ?? {}) as Record<string, string>;
  switch (n.type) {
    case "added_to_project":
      return { text: `You were added to the project "${p.project_title}"`, href: `/projects/${p.project_id}` };
    default:
      return { text: n.type.replaceAll("_", " ") };
  }
}

export default async function NotificationsPage() {
  const user = (await getUser())!;
  const items = await getNotifications(user.id);
  const unread = items.filter((n) => !n.read_at).length;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Notifications"
        description="Activity related to you and your projects."
        actions={
          unread > 0 ? (
            <form action={markAllRead}>
              <Button type="submit" variant="outline" size="sm">
                <CheckCheck />
                Mark all read
              </Button>
            </form>
          ) : undefined
        }
      />
      {items.length === 0 ? (
        <EmptyState icon={Bell} title="Nothing here yet" description="You will see activity here when someone adds you to a project." />
      ) : (
        <div className="grid gap-2">
          {items.map((n) => {
            const { text, href } = describe(n);
            const body = (
              <CardContent className="flex items-start gap-3 py-3">
                <span className={cn("mt-2 size-2 shrink-0 rounded-full", n.read_at ? "bg-transparent" : "bg-primary")} />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm", !n.read_at && "font-medium")}>{text}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(n.created_at)}</p>
                </div>
              </CardContent>
            );
            return (
              <Card key={n.id} className={cn("py-0", !n.read_at && "border-primary/30")}>
                {href ? <Link href={href}>{body}</Link> : body}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
