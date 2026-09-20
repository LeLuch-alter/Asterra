import { createClient } from "@/lib/supabase/server";
import type { ResearchResult, ResearchResultWithAuthor } from "@/types";

export async function getResults(projectId: string): Promise<ResearchResultWithAuthor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("research_results")
    .select("*, author:profiles(id, full_name, avatar_url)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as ResearchResultWithAuthor[];
}

export async function getResult(id: string): Promise<ResearchResult | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("research_results").select("*").eq("id", id).maybeSingle();
  return data;
}
