import { createClient } from "@/lib/supabase/server";
import type { Project, ProjectMemberWithProfile, ProjectSummary } from "@/types";

const SUMMARY_SELECT = "*, owner:profiles!projects_owner_id_fkey(id, full_name, avatar_url), project_members(count)";

type SummaryRow = Project & {
  owner: ProjectSummary["owner"];
  project_members: { count: number }[];
};

function toSummary(row: SummaryRow): ProjectSummary {
  const { project_members, ...rest } = row;
  return { ...rest, member_count: project_members?.[0]?.count ?? 0 };
}

export type ProjectFilters = {
  q?: string;
  field?: string;
  status?: string;
  skill?: string;
};

export async function searchProjects(filters: ProjectFilters = {}, limit = 48): Promise<ProjectSummary[]> {
  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select(SUMMARY_SELECT)
    .neq("status", "archived")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (filters.q) {
    const q = `%${filters.q}%`;
    query = query.or(`title.ilike.${q},description.ilike.${q},research_question.ilike.${q}`);
  }
  if (filters.field) query = query.eq("research_field", filters.field);
  if (filters.status) query = query.eq("status", filters.status as Project["status"]);
  if (filters.skill) query = query.contains("required_skills", [filters.skill]);

  const { data } = await query;
  return ((data ?? []) as unknown as SummaryRow[]).map(toSummary);
}

/** Projects where the user is a member (including owned). */
export async function getMyProjects(userId: string): Promise<ProjectSummary[]> {
  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", userId);
  const ids = (memberships ?? []).map((m) => m.project_id);
  if (ids.length === 0) return [];

  const { data } = await supabase
    .from("projects")
    .select(SUMMARY_SELECT)
    .in("id", ids)
    .order("updated_at", { ascending: false });
  return ((data ?? []) as unknown as SummaryRow[]).map(toSummary);
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function getProjectMembers(projectId: string): Promise<ProjectMemberWithProfile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_members")
    .select("*, profile:profiles(*)")
    .eq("project_id", projectId)
    .order("joined_at");
  return (data ?? []) as unknown as ProjectMemberWithProfile[];
}

/** Returns the membership role of a user in a project, or null. */
export async function getMemberRole(projectId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();
  return data?.role ?? null;
}

/** Projects a given user belongs to — used on public researcher profiles. */
export async function getProjectsForUser(userId: string): Promise<ProjectSummary[]> {
  return getMyProjects(userId);
}
