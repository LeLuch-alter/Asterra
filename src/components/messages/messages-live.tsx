"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Refreshes server data whenever a message involving the signed-in user arrives.
 * Used by both the inbox and a single thread; `threadWith` limits it to one partner.
 */
export function MessagesLive({ userId, threadWith }: { userId: string; threadWith?: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${userId}:${threadWith ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${userId}` },
        (payload) => {
          const m = payload.new as { sender_id: string };
          if (threadWith && m.sender_id !== threadWith) return;
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, threadWith, router]);

  return null;
}
