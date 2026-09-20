"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";

/** Saves or unsaves a project for the current user. Returns the new state. */
export async function toggleBookmark(projectId: string): Promise<ActionResult<{ bookmarked: boolean }>> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("project_id")
    .eq("user_id", user.id)
    .eq("project_id", projectId)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("project_id", projectId)
    : await supabase.from("bookmarks").insert({ user_id: user.id, project_id: projectId });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/bookmarks");
  revalidatePath(`/projects/${projectId}`);
  return { ok: true, data: { bookmarked: !existing } };
}
