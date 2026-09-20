import { NextResponse } from "next/server";
import { z } from "zod";
import { findMatches } from "@/lib/ai/match";
import { aiErrorResponse, requireProjectMember } from "../../_lib/ai-route";

const bodySchema = z.object({
  projectId: z.uuid(),
  lookingFor: z.enum(["collaborators", "mentors"]).default("collaborators"),
});

export async function POST(request: Request) {
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const guard = await requireProjectMember(body.data.projectId);
  if ("error" in guard) return guard.error;

  try {
    const matches = await findMatches(guard.project, body.data.lookingFor);
    return NextResponse.json({ matches });
  } catch (err) {
    return aiErrorResponse(err);
  }
}
