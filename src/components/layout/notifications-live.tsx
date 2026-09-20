"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types";

/** Human-readable text for a notification, shared with the notifications page. */
export function describeNotification(n: Pick<Notification, "type" | "payload">): { text: string; href?: string } {
  const p = (n.payload ?? {}) as Record<string, string>;
  switch (n.type) {
    case "added_to_project":
      return { text: `You were added to the project “${p.project_title}”`, href: `/projects/${p.project_id}` };
    case "connection_request":
      return { text: `${p.from_name} wants to connect with you`, href: "/connections" };
    case "connection_accepted":
      return { text: `${p.from_name} accepted your connection request`, href: `/researchers/${p.from}` };
    case "join_request":
      return { text: `${p.from_name} asked to join “${p.project_title}”`, href: `/projects/${p.project_id}/team` };
    case "join_accepted":
      return { text: `Your request to join “${p.project_title}” was accepted`, href: `/projects/${p.project_id}` };
    case "join_declined":
      return { text: `Your request to join “${p.project_title}” was declined`, href: `/projects/${p.project_id}` };
    case "project_invite":
      return { text: `${p.from_name} invited you to join “${p.project_title}”`, href: "/notifications" };
    case "invite_accepted":
      return { text: `${p.from_name} accepted your invitation to “${p.project_title}”`, href: `/projects/${p.project_id}/team` };
    case "invite_declined":
      return { text: `${p.from_name} declined your invitation to “${p.project_title}”`, href: `/projects/${p.project_id}/team` };
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

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as Notification;
          const { text, href } = describeNotification(n);
          toast(text, href ? { action: { label: "Open", onClick: () => router.push(href) } } : undefined);
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  return null;
}
