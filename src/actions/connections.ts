"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";

function revalidateSocial(otherId: string) {
  revalidatePath("/connections");
  revalidatePath("/researchers");
  revalidatePath(`/researchers/${otherId}`);
  revalidatePath("/search");
}

/** Sends a friend request; the addressee gets a notification. */
export async function sendConnectionRequest(otherId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  if (otherId === user.id) return { ok: false, error: "You cannot connect with yourself." };

  const supabase = await createClient();
  const { error } = await supabase.from("connections").insert({ requester_id: user.id, addressee_id: otherId });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "A connection already exists." };
    return { ok: false, error: error.message };
  }

  const { data: me } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  await supabase.from("notifications").insert({
    user_id: otherId,
    type: "connection_request",
    payload: { from: user.id, from_name: me?.full_name ?? "Someone" },
  });

  revalidateSocial(otherId);
  return { ok: true, data: undefined };
}

/** Accepts an incoming request (only the addressee can, enforced by RLS). */
export async function acceptConnection(connectionId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("connections")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", connectionId)
    .eq("addressee_id", user.id)
    .select("requester_id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Request not found." };

  const { data: me } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  await supabase.from("notifications").insert({
    user_id: data.requester_id,
    type: "connection_accepted",
    payload: { from: user.id, from_name: me?.full_name ?? "Someone" },
  });

  revalidateSocial(data.requester_id);
  return { ok: true, data: undefined };
}

/** Declines, cancels or removes a connection — either side can do this. */
export async function removeConnection(connectionId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("connections")
    .delete()
    .eq("id", connectionId)
    .select("requester_id, addressee_id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };

  const other = data ? (data.requester_id === user.id ? data.addressee_id : data.requester_id) : "";
  revalidateSocial(other);
  return { ok: true, data: undefined };
}
