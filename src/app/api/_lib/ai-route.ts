import { NextResponse } from "next/server";
import { AiError } from "@/lib/ai/provider";
import { getUser } from "@/lib/supabase/server";
import { getMemberRole, getProject } from "@/lib/supabase/queries/projects";

/** Shared guard for AI route handlers: signed-in user + project membership. */
export async function requireProjectMember(projectId: string) {
  const user = await getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const project = await getProject(projectId);
  if (!project) return { error: NextResponse.json({ error: "Project not found" }, { status: 404 }) };

  const role = await getMemberRole(projectId, user.id);
  if (!role) return { error: NextResponse.json({ error: "You are not a member of this project" }, { status: 403 }) };

  return { user, project, role };
}

/** Maps AiError / unknown errors to a JSON response with a friendly message. */
export function aiErrorResponse(err: unknown) {
  if (err instanceof AiError) {
    const status = err.code === "not_configured" ? 503 : err.code === "invalid_output" ? 502 : 500;
    return NextResponse.json({ error: err.message, code: err.code }, { status });
  }
  console.error(err);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}
