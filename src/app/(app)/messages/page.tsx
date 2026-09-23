import Link from "next/link";
import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { MessagesLive } from "@/components/messages/messages-live";
import { requireUser } from "@/lib/supabase/server";
import { getConversations } from "@/lib/supabase/queries/messages";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getLocale, getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const user = await requireUser();
  const conversations = await getConversations(user.id);
  const [t, locale] = await Promise.all([getT(), getLocale()]);

  return (
    <div className="mx-auto max-w-3xl">
      <MessagesLive userId={user.id} />
      <PageHeader
        eyebrow={t("Inbox")}
        title={t("Messages")}
        description={t("Private conversations with the researchers you are connected with.")}
        actions={
          <Button asChild variant="outline">
            <Link href="/connections">{t("New message")}</Link>
          </Button>
        }
      />

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={t("No conversations yet")}
          description={t("Connect with a researcher first, then start a conversation from their profile.")}
          action={
            <Button asChild>
              <Link href="/connections">{t("Go to connections")}</Link>
            </Button>
          }
        />
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {conversations.map(({ profile, last, unread }) => (
            <li key={profile.id}>
              <Link href={`/messages/${profile.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/60">
                <UserAvatar name={profile.full_name} src={profile.avatar_url} className="size-10" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate font-medium">{profile.full_name}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">{timeAgo(last.created_at, locale)}</span>
                  </div>
                  <p className={cn("truncate text-sm text-muted-foreground", unread > 0 && "text-foreground")}>
                    {last.sender_id === user.id && `${t("You")}: `}
                    {last.body}
                  </p>
                </div>
                {unread > 0 && (
                  <span className="shrink-0 rounded-full bg-primary px-1.5 font-mono text-[10px] font-semibold text-primary-foreground">
                    {unread}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
