import { GoogleGenAI } from "@google/genai";
import type { AiProvider } from "../provider";

export class GeminiProvider implements AiProvider {
  private client: GoogleGenAI;

  constructor(
    apiKey: string,
    private model: string,
  ) {
    this.client = new GoogleGenAI({ apiKey });
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
    const response = await this.client.models.generateContent({
      model: this.model,
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
  }
}
