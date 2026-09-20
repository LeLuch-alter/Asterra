"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { researchResultSchema } from "@/lib/validation/project";
import { parseForm } from "@/lib/validation/form";
import type { ActionResult } from "@/types";

export async function createResult(
  projectId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const parsed = parseForm(researchResultSchema, formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { error } = await supabase
    .from("research_results")
    .insert({ ...parsed.data, project_id: projectId, author_id: user.id });
  if (error) return { ok: false, error: "Could not save. Are you a member of this project?" };

  revalidatePath(`/projects/${projectId}/results`);
  return { ok: true, data: undefined };
}

export async function updateResult(
  resultId: string,
  projectId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const parsed = parseForm(researchResultSchema, formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { error } = await supabase.from("research_results").update(parsed.data).eq("id", resultId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/projects/${projectId}/results`);
  return { ok: true, data: undefined };
}

export async function deleteResult(resultId: string, projectId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const supabase = await createClient();
  const { error } = await supabase.from("research_results").delete().eq("id", resultId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/projects/${projectId}/results`);
  return { ok: true, data: undefined };
}
