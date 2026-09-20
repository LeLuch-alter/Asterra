import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getMemberRole, getProject } from "./projects";

/**
 * Loads the project + the current user's role for project pages.
 * Cached per request so the layout and page share one query.
 */
export const getProjectContext = cache(async (projectId: string) => {
  const user = await getUser();
  if (!user) redirect("/login");

  const project = await getProject(projectId);
  if (!project) notFound(); // RLS also hides private projects from non-members.

  const role = await getMemberRole(projectId, user.id);
  return {
    user,
    project,
    role,
    isMember: role !== null,
    isOwner: project.owner_id === user.id,
  };
});
