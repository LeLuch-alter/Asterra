import { NextResponse } from "next/server";
import { z } from "zod";
import { generateRoadmap } from "@/lib/ai/roadmap";
import { aiErrorResponse, requireProjectMember } from "../../_lib/ai-route";

const bodySchema = z.object({ projectId: z.uuid() });

export async function POST(request: Request) {
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const guard = await requireProjectMember(body.data.projectId);
  if ("error" in guard) return guard.error;

  try {
    const result = await generateRoadmap(guard.project);
    return NextResponse.json(result);
  } catch (err) {
    return aiErrorResponse(err);
  }
}
