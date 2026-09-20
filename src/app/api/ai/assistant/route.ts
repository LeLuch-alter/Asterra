import { NextResponse } from "next/server";
import { z } from "zod";
import { runAssistant } from "@/lib/ai/research-assistant";
import { assistantOperations } from "@/lib/ai/schemas";
import { getResult } from "@/lib/supabase/queries/results";
import { aiErrorResponse, requireProjectMember } from "../../_lib/ai-route";

const bodySchema = z.object({
  projectId: z.uuid(),
  operation: z.enum(assistantOperations),
  /** Either a saved research result... */
  resultId: z.uuid().optional(),
  /** ...or free text pasted by the user. */
  text: z.string().trim().max(30000).optional(),
});

export async function POST(request: Request) {
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const guard = await requireProjectMember(body.data.projectId);
  if ("error" in guard) return guard.error;

  let text = body.data.text ?? "";
  let textLabel = "Text";

  if (body.data.resultId) {
    const result = await getResult(body.data.resultId);
    if (!result || result.project_id !== guard.project.id) {
      return NextResponse.json({ error: "Research result not found" }, { status: 404 });
    }
    text = `${result.title}\n\n${result.content}`;
    textLabel = "Research result";
  } else if (!text) {
    // Fall back to the project itself.
    const p = guard.project;
    text = [p.description, p.research_question, p.hypothesis, p.methodology].filter(Boolean).join("\n\n");
    textLabel = "Project text";
  }

  if (!text.trim()) return NextResponse.json({ error: "There is no text to work with yet." }, { status: 400 });

  try {
    const result = await runAssistant({ operation: body.data.operation, project: guard.project, text, textLabel });
    return NextResponse.json(result);
  } catch (err) {
    return aiErrorResponse(err);
  }
}
