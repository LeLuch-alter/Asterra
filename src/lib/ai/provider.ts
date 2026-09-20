import "server-only";
import type { ZodType } from "zod";
import { serverEnv } from "@/lib/env";
import { GeminiProvider } from "./providers/gemini";
import { OpenAiProvider } from "./providers/openai";

export type GenerateJsonOptions<T> = {
  /** Who the model is and the rules it must follow. */
  system: string;
  /** The task + data for this call. */
  prompt: string;
  /** Zod schema every response is validated against before it reaches the UI. */
  schema: ZodType<T>;
  /** JSON Schema description of the expected output (helps the model). */
  jsonSchema?: Record<string, unknown>;
};

export interface AiProvider {
  /** Returns raw text that should be JSON. Parsing/validation happens in `generateJson`. */
  generateText(opts: { system: string; prompt: string; jsonSchema?: Record<string, unknown> }): Promise<string>;
}

export class AiError extends Error {
  constructor(
    message: string,
    public readonly code: "not_configured" | "provider" | "invalid_output",
  ) {
    super(message);
  }
}

let cached: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (cached) return cached;
  if (!serverEnv.aiConfigured) {
    throw new AiError("AI is not configured. Set AI_API_KEY in .env.local.", "not_configured");
  }
  cached =
    serverEnv.aiProvider === "openai"
      ? new OpenAiProvider(serverEnv.aiApiKey, serverEnv.aiModel)
      : new GeminiProvider(serverEnv.aiApiKey, serverEnv.aiModel);
  return cached;
}

/** Strips ```json fences some models add even in JSON mode. */
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : text).trim();
  const start = body.search(/[{[]/);
  return start > 0 ? body.slice(start) : body;
}

/** Calls the configured provider and validates the JSON response with the given zod schema. */
export async function generateJson<T>(opts: GenerateJsonOptions<T>): Promise<T> {
  const provider = getAiProvider();

  let text: string;
  try {
    text = await provider.generateText({ system: opts.system, prompt: opts.prompt, jsonSchema: opts.jsonSchema });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI provider request failed";
    throw new AiError(message, "provider");
  }

  let json: unknown;
  try {
    json = JSON.parse(extractJson(text));
  } catch {
    throw new AiError("The AI returned a response that could not be parsed.", "invalid_output");
  }

  const parsed = opts.schema.safeParse(json);
  if (!parsed.success) {
    throw new AiError("The AI returned an unexpected response shape.", "invalid_output");
  }
  return parsed.data;
}
