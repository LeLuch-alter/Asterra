"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";

/**
 * Sends a direct message. Only connections can be messaged — the database
 * policy enforces that, this check only produces a friendlier error.
 */
export async function sendMessage(recipientId: string, body: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const text = body.trim();
  if (!text) return { ok: false, error: "Write a message first." };
  if (text.length > 4000) return { ok: false, error: "Message is too long (max 4000 characters)." };
  if (recipientId === user.id) return { ok: false, error: "You cannot message yourself." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("messages")
    .insert({ sender_id: user.id, recipient_id: recipientId, body: text });
  if (error) return { ok: false, error: "Could not send. You can only message your connections." };

  const { data: me } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  await supabase.from("notifications").insert({
    user_id: recipientId,
    type: "message",
    payload: { from: user.id, from_name: me?.full_name ?? "Someone" },
  });

  revalidatePath("/messages");
  revalidatePath(`/messages/${recipientId}`);
  return { ok: true, data: undefined };
}

/** Marks every message from `otherId` as read. */
export async function markThreadRead(otherId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .eq("sender_id", otherId)
    .is("read_at", null);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/messages");
  return { ok: true, data: undefined };
}
