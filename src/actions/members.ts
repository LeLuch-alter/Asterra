"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";

// Members are only added with the other person's consent:
// see actions/invitations.ts (owner invites a connection) and actions/join-requests.ts (person asks, owner accepts).

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
