import type { AiProvider } from "../provider";

/**
 * Minimal Chat Completions client (JSON mode) — no SDK dependency.
 * Works with OpenAI and with OpenAI-compatible APIs such as xAI Grok.
 */
export class OpenAiCompatibleProvider implements AiProvider {
  constructor(
    private apiKey: string,
    private model: string,
    private baseUrl: string,
    private label: string,
  ) {}

  async generateText({ system, prompt }: { system: string; prompt: string }): Promise<string> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
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
      const body = await res.text().catch(() => "");
      const detail = body.match(/"message"\s*:\s*"([^"]{0,160})/)?.[1];
      throw new Error(`${this.label} request failed (${res.status})${detail ? `: ${detail}` : ""}`);
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error(`Empty response from ${this.label}`);
    return text;
  }
}

export class OpenAiProvider extends OpenAiCompatibleProvider {
  constructor(apiKey: string, model: string) {
    super(apiKey, model, "https://api.openai.com/v1", "OpenAI");
  }
}

export class GrokProvider extends OpenAiCompatibleProvider {
  constructor(apiKey: string, model: string) {
    super(apiKey, model, "https://api.x.ai/v1", "Grok");
  }
}
