"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validation/project";
import { parseForm } from "@/lib/validation/form";
import type { ActionResult } from "@/types";

export async function createProject(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const parsed = parseForm(projectSchema, formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...parsed.data, owner_id: user.id })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect(`/projects/${data.id}`);
}

export async function updateProject(
  projectId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const parsed = parseForm(projectSchema, formData);
  if (!parsed.ok) return parsed;

  // RLS restricts updates to project members; the error below covers the non-member case.
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update(parsed.data).eq("id", projectId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  redirect(`/projects/${projectId}`);
}

export async function archiveProject(projectId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ status: "archived" })
    .eq("id", projectId)
    .eq("owner_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
