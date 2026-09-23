"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types";
import { useT } from "@/lib/i18n/provider";
import type { Translator } from "@/lib/i18n/config";

/** Human-readable text for a notification, shared with the notifications page. */
export function describeNotification(
  n: Pick<Notification, "type" | "payload">,
  t: Translator,
): { text: string; href?: string } {
  const p = (n.payload ?? {}) as Record<string, string>;
  switch (n.type) {
    case "added_to_project":
      return { text: t("You were added to the project “{title}”", { title: p.project_title }), href: `/projects/${p.project_id}` };
    case "connection_request":
      return { text: t("{name} wants to connect with you", { name: p.from_name }), href: "/connections" };
    case "message":
      return { text: t("{name} sent you a message", { name: p.from_name }), href: `/messages/${p.from}` };
    case "connection_accepted":
      return { text: t("{name} accepted your connection request", { name: p.from_name }), href: `/researchers/${p.from}` };
    case "join_request":
      return { text: t("{name} asked to join “{title}”", { name: p.from_name, title: p.project_title }), href: `/projects/${p.project_id}/team` };
    case "join_accepted":
      return { text: t("Your request to join “{title}” was accepted", { title: p.project_title }), href: `/projects/${p.project_id}` };
    case "join_declined":
      return { text: t("Your request to join “{title}” was declined", { title: p.project_title }), href: `/projects/${p.project_id}` };
    case "project_invite":
      return { text: t("{name} invited you to join “{title}”", { name: p.from_name, title: p.project_title }), href: "/notifications" };
    case "invite_accepted":
      return { text: t("{name} accepted your invitation to “{title}”", { name: p.from_name, title: p.project_title }), href: `/projects/${p.project_id}/team` };
    case "invite_declined":
      return { text: t("{name} declined your invitation to “{title}”", { name: p.from_name, title: p.project_title }), href: `/projects/${p.project_id}/team` };
    default:
      return { text: n.type.replaceAll("_", " ") };
  }
}

/**
 * Subscribes to the signed-in user's notifications via Supabase Realtime.
 * New rows show a toast and refresh server data (badges, lists) without a reload.
 */
export function NotificationsLive({ userId }: { userId: string }) {
  const router = useRouter();
  const t = useT();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as Notification;
          const { text, href } = describeNotification(n, t);
          toast(text, href ? { action: { label: t("Open"), onClick: () => router.push(href) } } : undefined);
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router, t]);

  return null;
}
