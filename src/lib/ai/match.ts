import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { MatchCandidate, Profile, Project } from "@/types";
import { generateJson } from "./provider";
import { matchJsonSchema, matchResponseSchema } from "./schemas";
import { matchPrompt, matchSystem, type MatchCandidateInput } from "./prompts";

const MAX_CANDIDATES = 25;

/**
 * Cheap SQL pre-filter: profiles that are not already members, ranked by
 * field/skill overlap, so the model only sees a manageable shortlist.
 */
async function retrieveCandidates(project: Project, lookingFor: "collaborators" | "mentors"): Promise<Profile[]> {
  const supabase = await createClient();

  const { data: members } = await supabase.from("project_members").select("user_id").eq("project_id", project.id);
  const memberIds = new Set((members ?? []).map((m) => m.user_id));

  let query = supabase.from("profiles").select("*").limit(200);
  if (lookingFor === "mentors") query = query.eq("is_mentor", true);
  const { data } = await query;

  const wantedSkills = project.required_skills.map((s) => s.toLowerCase());
  const field = project.research_field.toLowerCase();

  return (data ?? [])
    .filter((p) => !memberIds.has(p.id))
    .map((p) => {
      const skillHits = p.skills.filter((s) => wantedSkills.includes(s.toLowerCase())).length;
      const fieldHit = p.research_fields.some((f) => f.toLowerCase() === field) ? 1 : 0;
      return { p, score: fieldHit * 3 + skillHits };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CANDIDATES)
    .map((x) => x.p);
}

async function previousProjectFields(profileIds: string[]): Promise<Map<string, string[]>> {
  const supabase = await createClient();
  const map = new Map<string, string[]>();
  if (profileIds.length === 0) return map;

  const { data } = await supabase
    .from("project_members")
    .select("user_id, project:projects(research_field)")
    .in("user_id", profileIds);

  for (const row of (data ?? []) as unknown as { user_id: string; project: { research_field: string } | null }[]) {
    const field = row.project?.research_field;
    if (!field) continue;
    const list = map.get(row.user_id) ?? [];
    if (!list.includes(field)) list.push(field);
    map.set(row.user_id, list);
  }
  return map;
}

export async function findMatches(
  project: Project,
  lookingFor: "collaborators" | "mentors",
): Promise<MatchCandidate[]> {
  const candidates = await retrieveCandidates(project, lookingFor);
  if (candidates.length === 0) return [];

  const prevFields = await previousProjectFields(candidates.map((c) => c.id));
  const inputs: MatchCandidateInput[] = candidates.map((c) => ({
    id: c.id,
    full_name: c.full_name,
    role: c.role,
    organization: c.organization,
    bio: c.bio,
    research_fields: c.research_fields,
    skills: c.skills,
    interests: c.interests,
    experience_years: c.experience_years,
    is_mentor: c.is_mentor,
    previous_project_fields: prevFields.get(c.id) ?? [],
  }));

  const response = await generateJson({
    system: matchSystem,
    prompt: matchPrompt(project, inputs, lookingFor),
    schema: matchResponseSchema,
    jsonSchema: matchJsonSchema,
  });

  // Only keep candidates we actually sent (the model must not invent people).
  const byId = new Map(candidates.map((c) => [c.id, c]));
  return response.matches
    .filter((m) => byId.has(m.candidate_id))
    .sort((a, b) => b.score - a.score)
    .map((m) => {
      const c = byId.get(m.candidate_id)!;
      return {
        candidate: {
          id: c.id,
          full_name: c.full_name,
          avatar_url: c.avatar_url,
          organization: c.organization,
          role: c.role,
          skills: c.skills,
          research_fields: c.research_fields,
        },
        score: Math.round(m.score),
        summary: m.summary,
        overlapping_skills: m.overlapping_skills,
        overlapping_fields: m.overlapping_fields,
        experience_note: m.experience_note,
      };
    });
}
