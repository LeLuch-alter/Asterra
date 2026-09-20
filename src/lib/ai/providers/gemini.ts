import { ApiError, GoogleGenAI } from "@google/genai";
import type { AiProvider } from "../provider";

/**
 * Models to try in order when the configured one fails.
 * Google retires models for new keys (404) and overloads others (503),
 * so the chain is checked live: a 404 skips the model, a 429/500/503 retries once and then skips.
 */
const FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
];
const RETRYABLE = new Set([429, 500, 503]);
const SKIPPABLE = new Set([404]);
const ATTEMPTS_PER_MODEL = 2;

function statusOf(err: unknown): number | undefined {
  if (err instanceof ApiError) return err.status;
  if (err instanceof Error) {
    const m = err.message.match(/"code":\s*(\d{3})|\b(404|429|500|503)\b/);
    return m ? Number(m[1] ?? m[2]) : undefined;
  }
  return undefined;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class GeminiProvider implements AiProvider {
  private client: GoogleGenAI;
  private models: string[];

  constructor(apiKey: string, model: string) {
    this.client = new GoogleGenAI({ apiKey });
    this.models = [model, ...FALLBACK_MODELS.filter((m) => m !== model)];
  }

  async generateText({
    system,
    prompt,
    jsonSchema,
  }: {
    system: string;
    prompt: string;
    jsonSchema?: Record<string, unknown>;
  }): Promise<string> {
    const failures: string[] = [];

    for (const model of this.models) {
      for (let attempt = 0; attempt < ATTEMPTS_PER_MODEL; attempt++) {
        try {
          const response = await this.client.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction: system,
              responseMimeType: "application/json",
              ...(jsonSchema ? { responseJsonSchema: jsonSchema } : {}),
              temperature: 0.4,
            },
          });
          const text = response.text;
          if (!text) throw new Error("Empty response from Gemini");
          return text;
        } catch (err) {
          const status = statusOf(err);
          failures.push(`${model}: ${status ?? "error"}`);
          if (status !== undefined && SKIPPABLE.has(status)) break; // model gone for this key → next model
          if (status === undefined || !RETRYABLE.has(status)) throw err; // real error (bad key, bad request…)
          if (attempt < ATTEMPTS_PER_MODEL - 1) await sleep(800 * (attempt + 1));
        }
      }
    }

    throw new Error(`The AI service is busy or unavailable right now. Please try again in a minute. (${failures.join(", ")})`);
  }
}
