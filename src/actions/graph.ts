"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, getUser } from "@/lib/supabase/server";
import { parseForm } from "@/lib/validation/form";
import type { ActionResult } from "@/types";

// ---------- Experiments ----------

const experimentSchema = z.object({
  title: z.string().trim().min(1, "Enter a title").max(200),
  purpose: z.string().trim().max(2000).default(""),
  methodology: z.string().trim().max(4000).default(""),
  data_description: z.string().trim().max(2000).default(""),
  outcome: z.string().trim().max(4000).default(""),
  status: z.enum(["planned", "running", "done", "failed"]).default("planned"),
});

export async function createExperiment(
  projectId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const parsed = parseForm(experimentSchema, formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { count } = await supabase
    .from("experiments")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  const { error } = await supabase
    .from("experiments")
    .insert({ ...parsed.data, project_id: projectId, author_id: user.id, position: count ?? 0 });
  if (error) return { ok: false, error: "Could not save. Are you a member of this project?" };

  revalidatePath(`/projects/${projectId}/experiments`);
  revalidatePath(`/projects/${projectId}/graph`);
  return { ok: true, data: undefined };
}

export async function updateExperiment(
  experimentId: string,
  projectId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const parsed = parseForm(experimentSchema, formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { error } = await supabase.from("experiments").update(parsed.data).eq("id", experimentId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/projects/${projectId}/experiments`);
  revalidatePath(`/projects/${projectId}/graph`);
  return { ok: true, data: undefined };
}

export async function deleteExperiment(experimentId: string, projectId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const supabase = await createClient();
  const { error } = await supabase.from("experiments").delete().eq("id", experimentId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/projects/${projectId}/experiments`);
  revalidatePath(`/projects/${projectId}/graph`);
  return { ok: true, data: undefined };
}

/** Attaches a research result to an experiment (or detaches it with an empty id). */
export async function linkResultToExperiment(
  resultId: string,
  projectId: string,
  experimentId: string | null,
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const supabase = await createClient();
  const { error } = await supabase.from("research_results").update({ experiment_id: experimentId }).eq("id", resultId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/projects/${projectId}/results`);
  revalidatePath(`/projects/${projectId}/graph`);
  return { ok: true, data: undefined };
}

// ---------- Scientific sources ----------

const sourceSchema = z.object({
  title: z.string().trim().min(1, "Enter the title of the paper or dataset").max(300),
  authors: z.string().trim().max(300).default(""),
  year: z
    .string()
    .trim()
    .default("")
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 1500 && v <= 2200), "Enter a valid year"),
  url: z.string().trim().max(500).default(""),
  note: z.string().trim().max(1000).default(""),
  target_type: z
    .enum(["project", "research_question", "hypothesis", "methodology", "experiment", "result", "roadmap_item"])
    .default("project"),
  target_id: z
    .string()
    .trim()
    .default("")
    .transform((v) => (v ? v : null)),
});

export async function createSource(
  projectId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const parsed = parseForm(sourceSchema, formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { error } = await supabase
    .from("research_sources")
    .insert({ ...parsed.data, project_id: projectId, added_by: user.id });
  if (error) return { ok: false, error: "Could not save. Are you a member of this project?" };

  revalidatePath(`/projects/${projectId}/sources`);
  revalidatePath(`/projects/${projectId}/graph`);
  return { ok: true, data: undefined };
}

export async function deleteSource(sourceId: string, projectId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const supabase = await createClient();
  const { error } = await supabase.from("research_sources").delete().eq("id", sourceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/projects/${projectId}/sources`);
  revalidatePath(`/projects/${projectId}/graph`);
  return { ok: true, data: undefined };
}

// ---------- Fork ----------

/**
 * Creates a new research direction based on an existing project.
 * The original stays untouched; the new project keeps a link to its origin.
 */
export async function forkProject(projectId: string, title: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("fork_project", { p_project_id: projectId, p_title: title.trim() });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${data as string}`);
}
