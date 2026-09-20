import { createClient } from "@/lib/supabase/server";
import type { RoadmapItem } from "@/types";

export async function getRoadmap(projectId: string): Promise<RoadmapItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("research_roadmap_items")
    .select("*")
    .eq("project_id", projectId)
    .order("position");
  return data ?? [];
}
