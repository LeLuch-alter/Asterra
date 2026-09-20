import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export async function getProfile(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  return data;
}

export type ResearcherFilters = {
  q?: string;
  field?: string;
  skill?: string;
  mentorsOnly?: boolean;
};

export async function searchProfiles(filters: ResearcherFilters = {}, limit = 48): Promise<Profile[]> {
  const supabase = await createClient();
  let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(limit);

  if (filters.q) {
    const q = `%${filters.q}%`;
    query = query.or(`full_name.ilike.${q},organization.ilike.${q},bio.ilike.${q}`);
  }
  if (filters.field) query = query.contains("research_fields", [filters.field]);
  if (filters.skill) query = query.contains("skills", [filters.skill]);
  if (filters.mentorsOnly) query = query.eq("is_mentor", true);

  const { data } = await query;
  return data ?? [];
}
