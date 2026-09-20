import { ApiError, GoogleGenAI } from "@google/genai";
import type { AiProvider } from "../provider";

/** Models to try in order when the configured one is overloaded or unavailable. */
const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite"];
const RETRYABLE = new Set([429, 500, 503]);
const ATTEMPTS_PER_MODEL = 2;

function statusOf(err: unknown): number | undefined {
  if (err instanceof ApiError) return err.status;
  if (err instanceof Error) {
    const m = err.message.match(/"code":\s*(\d{3})|\b(429|500|503)\b/);
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
    let lastError: unknown;

    // Gemini returns 503 "high demand" fairly often; retry briefly, then move to the next model.
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
          lastError = err;
          const status = statusOf(err);
          if (status === undefined || !RETRYABLE.has(status)) throw err;
          if (attempt < ATTEMPTS_PER_MODEL - 1) await sleep(800 * (attempt + 1));
        }
      }
    }

    throw new Error(
      `The AI service is busy right now (tried ${this.models.length} models). Please try again in a minute. ` +
        (lastError instanceof Error ? `[${lastError.message.slice(0, 120)}]` : ""),
    );
  }
}
