import { createClient } from "@/lib/supabase/server";
import type { Message, ProfileLite } from "@/types";

/** One row in the conversation list: the other person, the last message and unread count. */
export type Conversation = {
  profile: ProfileLite;
  last: Message;
  unread: number;
};

const PROFILE_FIELDS = "id, full_name, avatar_url, organization, role";

/**
 * All threads `me` takes part in, newest first.
 * Messages are few in a demo, so the grouping happens in JS instead of a SQL view.
 */
export async function getConversations(me: string): Promise<Conversation[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${me},recipient_id.eq.${me}`)
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = (data ?? []) as Message[];
  if (rows.length === 0) return [];

  const byPartner = new Map<string, { last: Message; unread: number }>();
  for (const m of rows) {
    const other = m.sender_id === me ? m.recipient_id : m.sender_id;
    const entry = byPartner.get(other) ?? { last: m, unread: 0 };
    if (m.recipient_id === me && !m.read_at) entry.unread += 1;
    byPartner.set(other, entry);
  }

  const { data: profiles } = await supabase.from("profiles").select(PROFILE_FIELDS).in("id", [...byPartner.keys()]);
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p as ProfileLite]));

  return [...byPartner.entries()]
    .map(([id, entry]) => {
      const profile = profileById.get(id);
      return profile ? { profile, ...entry } : null;
    })
    .filter((c): c is Conversation => c !== null);
}

/** The full thread between `me` and `other`, oldest first. */
export async function getThread(me: string, other: string): Promise<Message[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${me},recipient_id.eq.${other}),and(sender_id.eq.${other},recipient_id.eq.${me})`,
    )
    .order("created_at")
    .limit(300);
  return (data ?? []) as Message[];
}

/** Unread messages across all threads — drives the sidebar badge. */
export async function getUnreadMessageCount(me: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", me)
    .is("read_at", null);
  return count ?? 0;
}
