import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { MessageThread } from "@/components/messages/message-thread";
import { MessagesLive } from "@/components/messages/messages-live";
import { requireUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries/profiles";
import { getConnectionState } from "@/lib/supabase/queries/social";
import { getThread } from "@/lib/supabase/queries/messages";
import { USER_ROLE_LABELS } from "@/types";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Conversation" };

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  if (id === user.id) notFound();

  const [other, state, messages] = await Promise.all([
    getProfile(id),
    getConnectionState(user.id, id),
    getThread(user.id, id),
  ]);
  if (!other) notFound();
  const t = await getT();

  return (
    <div className="mx-auto max-w-3xl">
      <MessagesLive userId={user.id} threadWith={id} />

      <div className="mb-6 flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label={t("Back to messages")}>
          <Link href="/messages">
            <ArrowLeft />
          </Link>
        </Button>
        <UserAvatar name={other.full_name} src={other.avatar_url} className="size-10" />
        <div className="min-w-0">
          <Link href={`/researchers/${other.id}`} className="font-medium hover:underline">
            {other.full_name}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {t(USER_ROLE_LABELS[other.role])}
            {other.organization && ` · ${other.organization}`}
          </p>
        </div>
      </div>

      <MessageThread
        me={user.id}
        other={{ id: other.id, full_name: other.full_name }}
        messages={messages}
        canMessage={state.kind === "connected"}
      />
    </div>
  );
}
