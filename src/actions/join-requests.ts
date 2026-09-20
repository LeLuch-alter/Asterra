"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";

/** A non-member asks to join a project; the owner is notified. */
export async function requestToJoin(projectId: string, message: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("owner_id, title").eq("id", projectId).maybeSingle();
  if (!project) return { ok: false, error: "Project not found." };

  const { error } = await supabase
    .from("project_join_requests")
    .insert({ project_id: projectId, user_id: user.id, message: message.trim().slice(0, 500) });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "You already sent a request." };
    return { ok: false, error: error.message };
  }

  const { data: me } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  await supabase.from("notifications").insert({
    user_id: project.owner_id,
    type: "join_request",
    payload: { project_id: projectId, project_title: project.title, from: user.id, from_name: me?.full_name ?? "Someone" },
  });

  revalidatePath(`/projects/${projectId}`);
  return { ok: true, data: undefined };
}

/** Owner accepts (adds member) or declines a join request. */
export async function respondToJoinRequest(requestId: string, accept: boolean): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const supabase = await createClient();
  const { data: req } = await supabase
    .from("project_join_requests")
    .select("*, project:projects(owner_id, title)")
    .eq("id", requestId)
    .maybeSingle();
  const project = (req as unknown as { project: { owner_id: string; title: string } | null } | null)?.project;
  if (!req || !project) return { ok: false, error: "Request not found." };
  if (project.owner_id !== user.id) return { ok: false, error: "Only the project owner can respond." };

  if (accept) {
    const { error: memberError } = await supabase
      .from("project_members")
      .insert({ project_id: req.project_id, user_id: req.user_id, role: "contributor" });
    if (memberError && memberError.code !== "23505") return { ok: false, error: memberError.message };
  }

  const { error } = await supabase
    .from("project_join_requests")
    .update({ status: accept ? "accepted" : "declined", responded_at: new Date().toISOString() })
    .eq("id", requestId);
  if (error) return { ok: false, error: error.message };

  await supabase.from("notifications").insert({
    user_id: req.user_id,
    type: accept ? "join_accepted" : "join_declined",
    payload: { project_id: req.project_id, project_title: project.title },
  });

  revalidatePath(`/projects/${req.project_id}`);
  revalidatePath(`/projects/${req.project_id}/team`);
  return { ok: true, data: undefined };
}

export async function cancelJoinRequest(projectId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_join_requests")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { ok: true, data: undefined };
}
