import "server-only";
import type { Project } from "@/types";
import { generateJson } from "./provider";
import { assistantJsonSchema, assistantResponseSchema, type AssistantOperation, type AssistantResponse } from "./schemas";
import { assistantPrompt, assistantSystem } from "./prompts";

const MAX_TEXT_CHARS = 24000;

export async function runAssistant(opts: {
  operation: AssistantOperation;
  project: Project;
  text: string;
  textLabel: string;
}): Promise<AssistantResponse> {
  return generateJson({
    system: assistantSystem,
    prompt: assistantPrompt({ ...opts, text: opts.text.slice(0, MAX_TEXT_CHARS) }),
    schema: assistantResponseSchema,
    jsonSchema: assistantJsonSchema,
  });
}
