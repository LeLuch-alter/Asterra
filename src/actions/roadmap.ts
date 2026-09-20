"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, getUser } from "@/lib/supabase/server";
import { roadmapItemSchema } from "@/lib/validation/project";
import type { ActionResult, RoadmapItem } from "@/types";

const draftSchema = z.array(roadmapItemSchema.pick({ title: true, description: true })).min(1).max(30);

/** Replaces the whole roadmap with a new list (used after AI generation). */
export async function saveRoadmap(projectId: string, items: unknown): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const parsed = draftSchema.safeParse(items);
  if (!parsed.success) return { ok: false, error: "Invalid roadmap data." };

  const supabase = await createClient();
  const { error: delError } = await supabase.from("research_roadmap_items").delete().eq("project_id", projectId);
  if (delError) return { ok: false, error: delError.message };

  const { error } = await supabase
    .from("research_roadmap_items")
    .insert(parsed.data.map((item, i) => ({ ...item, project_id: projectId, position: i })));
  if (error) return { ok: false, error: "Could not save. Are you a member of this project?" };

  revalidatePath(`/projects/${projectId}/roadmap`);
  return { ok: true, data: undefined };
}

export async function addRoadmapItem(projectId: string, input: unknown): Promise<ActionResult<RoadmapItem>> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const parsed = roadmapItemSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid item." };

  const supabase = await createClient();
  const { count } = await supabase
    .from("research_roadmap_items")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  const { data, error } = await supabase
    .from("research_roadmap_items")
    .insert({ ...parsed.data, project_id: projectId, position: count ?? 0 })
    .select("*")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/projects/${projectId}/roadmap`);
  return { ok: true, data };
}

export async function updateRoadmapItem(itemId: string, projectId: string, input: unknown): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const parsed = roadmapItemSchema.partial().safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid item." };

  const supabase = await createClient();
  const { error } = await supabase.from("research_roadmap_items").update(parsed.data).eq("id", itemId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/projects/${projectId}/roadmap`);
  return { ok: true, data: undefined };
}

export async function deleteRoadmapItem(itemId: string, projectId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const supabase = await createClient();
  const { error } = await supabase.from("research_roadmap_items").delete().eq("id", itemId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/projects/${projectId}/roadmap`);
  return { ok: true, data: undefined };
}

/** Persists a new order: array of item ids in display order. */
export async function reorderRoadmap(projectId: string, orderedIds: string[]): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const supabase = await createClient();
  const results = await Promise.all(
    orderedIds.map((id, position) =>
      supabase.from("research_roadmap_items").update({ position }).eq("id", id).eq("project_id", projectId),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };

  revalidatePath(`/projects/${projectId}/roadmap`);
  return { ok: true, data: undefined };
}
