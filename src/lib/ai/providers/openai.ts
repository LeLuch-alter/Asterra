import type { AiProvider } from "../provider";

/** Minimal OpenAI Chat Completions client (JSON mode) — no SDK dependency needed. */
export class OpenAiProvider implements AiProvider {
  constructor(
    private apiKey: string,
    private model: string,
  ) {}

  async generateText({ system, prompt }: { system: string; prompt: string }): Promise<string> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI request failed (${res.status})`);
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from OpenAI");
    return text;
  }
}
