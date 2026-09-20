"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { memberRoleSchema } from "@/lib/validation/project";
import type { ActionResult } from "@/types";

export async function addMember(projectId: string, userId: string, role: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const parsedRole = memberRoleSchema.safeParse(role);
  if (!parsedRole.success) return { ok: false, error: "Invalid role." };

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("owner_id, title")
    .eq("id", projectId)
    .maybeSingle();
  if (!project || project.owner_id !== user.id) {
    return { ok: false, error: "Only the project owner can add members." };
  }

  const { error } = await supabase
    .from("project_members")
    .insert({ project_id: projectId, user_id: userId, role: parsedRole.data });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "This person is already a member." };
    return { ok: false, error: error.message };
  }

  // Basic activity feedback for the invited person.
  await supabase.from("notifications").insert({
    user_id: userId,
    type: "added_to_project",
    payload: { project_id: projectId, project_title: project.title, by: user.id },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/team`);
  return { ok: true, data: undefined };
}

export async function removeMember(projectId: string, userId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("owner_id").eq("id", projectId).maybeSingle();
  if (!project) return { ok: false, error: "Project not found." };
  if (userId === project.owner_id) return { ok: false, error: "The owner cannot be removed." };
  if (project.owner_id !== user.id && userId !== user.id) {
    return { ok: false, error: "Only the owner can remove other members." };
  }

  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/projects/${projectId}/team`);
  return { ok: true, data: undefined };
}
