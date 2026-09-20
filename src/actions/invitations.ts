"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { memberRoleSchema } from "@/lib/validation/project";
import type { ActionResult } from "@/types";

/**
 * Project owner invites one of their connections. RLS enforces both rules
 * (owner only, connected people only); the invitee must accept before becoming a member.
 */
export async function inviteToProject(
  projectId: string,
  inviteeId: string,
  role: string,
  message = "",
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const parsedRole = memberRoleSchema.safeParse(role);
  if (!parsedRole.success) return { ok: false, error: "Invalid role." };

  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("owner_id, title").eq("id", projectId).maybeSingle();
  if (!project) return { ok: false, error: "Project not found." };
  if (project.owner_id !== user.id) return { ok: false, error: "Only the project owner can invite people." };

  const { error } = await supabase.from("project_invitations").insert({
    project_id: projectId,
    inviter_id: user.id,
    invitee_id: inviteeId,
    role: parsedRole.data,
    message: message.trim().slice(0, 500),
  });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "This person was already invited." };
    if (error.code === "42501") return { ok: false, error: "You can only invite people you are connected with." };
    return { ok: false, error: error.message };
  }

  const { data: me } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  await supabase.from("notifications").insert({
    user_id: inviteeId,
    type: "project_invite",
    payload: { project_id: projectId, project_title: project.title, from: user.id, from_name: me?.full_name ?? "Someone" },
  });

  revalidatePath(`/projects/${projectId}/team`);
  revalidatePath(`/projects/${projectId}/match`);
  return { ok: true, data: undefined };
}

/** Invitee accepts (becomes a member via a security-definer function) or declines. */
export async function respondToInvitation(invitationId: string, accept: boolean): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const supabase = await createClient();
  const { data: inv } = await supabase
    .from("project_invitations")
    .select("*, project:projects(title)")
    .eq("id", invitationId)
    .eq("invitee_id", user.id)
    .maybeSingle();
  const title = (inv as unknown as { project: { title: string } | null } | null)?.project?.title ?? "the project";
  if (!inv) return { ok: false, error: "Invitation not found." };
  if (inv.status !== "pending") return { ok: false, error: "This invitation was already answered." };

  if (accept) {
    const { error } = await supabase.rpc("accept_project_invitation", { p_invitation_id: invitationId });
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("project_invitations")
      .update({ status: "declined", responded_at: new Date().toISOString() })
      .eq("id", invitationId);
    if (error) return { ok: false, error: error.message };
  }

  const { data: me } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  await supabase.from("notifications").insert({
    user_id: inv.inviter_id,
    type: accept ? "invite_accepted" : "invite_declined",
    payload: { project_id: inv.project_id, project_title: title, from: user.id, from_name: me?.full_name ?? "Someone" },
  });

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${inv.project_id}`);
  revalidatePath(`/projects/${inv.project_id}/team`);
  return { ok: true, data: undefined };
}

/** Owner withdraws a pending invitation. */
export async function cancelInvitation(invitationId: string, projectId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const supabase = await createClient();
  const { error } = await supabase.from("project_invitations").delete().eq("id", invitationId).eq("status", "pending");
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/projects/${projectId}/team`);
  return { ok: true, data: undefined };
}
