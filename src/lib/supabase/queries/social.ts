import { createClient } from "@/lib/supabase/server";
import type { Connection, ConnectionState, JoinRequest, ProfileLite, ProjectInvitation, ProjectSummary } from "@/types";

function toState(me: string, c: Connection): ConnectionState {
  if (c.status === "accepted") return { kind: "connected", id: c.id };
  return c.requester_id === me ? { kind: "outgoing", id: c.id } : { kind: "incoming", id: c.id };
}

/** Connection state between the current user and one other profile. */
export async function getConnectionState(me: string, other: string): Promise<ConnectionState> {
  if (me === other) return { kind: "self" };
  const supabase = await createClient();
  const { data } = await supabase
    .from("connections")
    .select("*")
    .or(`and(requester_id.eq.${me},addressee_id.eq.${other}),and(requester_id.eq.${other},addressee_id.eq.${me})`)
    .maybeSingle();
  return data ? toState(me, data) : { kind: "none" };
}

/**
 * Connection states for many profiles at once (lists, search results).
 * With an empty `ids` list it returns every person `me` has any connection with.
 */
export async function getConnectionStates(me: string, ids: string[]): Promise<Record<string, ConnectionState>> {
  const result: Record<string, ConnectionState> = {};
  const supabase = await createClient();
  const { data } = await supabase
    .from("connections")
    .select("*")
    .or(`requester_id.eq.${me},addressee_id.eq.${me}`);
  for (const c of data ?? []) {
    const other = c.requester_id === me ? c.addressee_id : c.requester_id;
    result[other] = toState(me, c);
  }
  for (const id of ids) result[id] ??= id === me ? { kind: "self" } : { kind: "none" };
  return result;
}

export type ConnectionWithProfile = Connection & { profile: ProfileLite };

/** Accepted connections + pending incoming/outgoing requests, each with the other person's profile. */
export async function getMyConnections(me: string): Promise<{
  accepted: ConnectionWithProfile[];
  incoming: ConnectionWithProfile[];
  outgoing: ConnectionWithProfile[];
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("connections")
    .select("*, requester:profiles!connections_requester_id_fkey(id, full_name, avatar_url, organization, role), addressee:profiles!connections_addressee_id_fkey(id, full_name, avatar_url, organization, role)")
    .or(`requester_id.eq.${me},addressee_id.eq.${me}`)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as (Connection & { requester: ProfileLite; addressee: ProfileLite })[];
  const withProfile = rows.map((c) => ({ ...c, profile: c.requester_id === me ? c.addressee : c.requester }));
  return {
    accepted: withProfile.filter((c) => c.status === "accepted"),
    incoming: withProfile.filter((c) => c.status === "pending" && c.addressee_id === me),
    outgoing: withProfile.filter((c) => c.status === "pending" && c.requester_id === me),
  };
}

export async function getIncomingConnectionCount(me: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("connections")
    .select("id", { count: "exact", head: true })
    .eq("addressee_id", me)
    .eq("status", "pending");
  return count ?? 0;
}

// ---------- Join requests ----------

export type JoinRequestWithProfile = JoinRequest & { profile: ProfileLite };

export async function getPendingJoinRequests(projectId: string): Promise<JoinRequestWithProfile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_join_requests")
    .select("*, profile:profiles(id, full_name, avatar_url, organization, role)")
    .eq("project_id", projectId)
    .eq("status", "pending")
    .order("created_at");
  return (data ?? []) as unknown as JoinRequestWithProfile[];
}

export async function getMyJoinRequest(projectId: string, me: string): Promise<JoinRequest | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_join_requests")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", me)
    .maybeSingle();
  return data;
}

// ---------- Bookmarks ----------

export async function getBookmarkedIds(me: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("bookmarks").select("project_id").eq("user_id", me);
  return new Set((data ?? []).map((b) => b.project_id));
}

export async function getBookmarkedProjects(me: string): Promise<ProjectSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookmarks")
    .select("created_at, project:projects(*, owner:profiles!projects_owner_id_fkey(id, full_name, avatar_url), project_members(count))")
    .eq("user_id", me)
    .order("created_at", { ascending: false });

  type Row = { project: (ProjectSummary & { project_members: { count: number }[] }) | null };
  return ((data ?? []) as unknown as Row[])
    .map((r) => r.project)
    .filter((p): p is NonNullable<Row["project"]> => Boolean(p))
    .map(({ project_members, ...p }) => ({ ...p, member_count: project_members?.[0]?.count ?? 0 }));
}

// ---------- Project invitations ----------

export type InvitationWithProfile = ProjectInvitation & { profile: ProfileLite };
export type InvitationWithProject = ProjectInvitation & {
  project: { id: string; title: string; research_field: string };
  inviter: ProfileLite;
};

/** Accepted connections of `me` who are not yet members of / invited to the project. */
export async function getInvitableConnections(me: string, projectId: string): Promise<ProfileLite[]> {
  const supabase = await createClient();
  const [{ accepted }, { data: members }, { data: invited }] = await Promise.all([
    getMyConnections(me),
    supabase.from("project_members").select("user_id").eq("project_id", projectId),
    supabase.from("project_invitations").select("invitee_id").eq("project_id", projectId).eq("status", "pending"),
  ]);
  const taken = new Set([...(members ?? []).map((m) => m.user_id), ...(invited ?? []).map((i) => i.invitee_id)]);
  return accepted.map((c) => c.profile).filter((p) => !taken.has(p.id));
}

/** Pending invitations sent for a project (owner view). */
export async function getPendingInvitationsForProject(projectId: string): Promise<InvitationWithProfile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_invitations")
    .select("*, profile:profiles!project_invitations_invitee_id_fkey(id, full_name, avatar_url, organization, role)")
    .eq("project_id", projectId)
    .eq("status", "pending")
    .order("created_at");
  return (data ?? []) as unknown as InvitationWithProfile[];
}

/** Pending invitations addressed to `me`. */
export async function getMyInvitations(me: string): Promise<InvitationWithProject[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_invitations")
    .select(
      "*, project:projects(id, title, research_field), inviter:profiles!project_invitations_inviter_id_fkey(id, full_name, avatar_url, organization, role)",
    )
    .eq("invitee_id", me)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as InvitationWithProject[];
}

/** Ids of everyone `me` has an accepted connection with. */
export async function getFriendIds(me: string): Promise<Set<string>> {
  const { accepted } = await getMyConnections(me);
  return new Set(accepted.map((c) => c.profile.id));
}
