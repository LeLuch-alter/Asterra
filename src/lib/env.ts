/**
 * Single place that reads process.env.
 *
 * - `publicEnv` is safe to use anywhere (browser + server).
 * - `serverEnv` must only be imported from server code (lib/ai, lib/news, actions, route handlers).
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export const publicEnv = {
  /** False when Supabase vars are missing (e.g. a fresh Vercel deploy without env vars). */
  get supabaseConfigured() {
    return Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    );
  },
  get siteUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  },
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  },
  get supabaseAnonKey() {
    // Supabase now issues "publishable" keys (sb_publishable_...); both names are accepted.
    return required(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
  },
};

export type AiProviderName = "gemini" | "openai";

/** AI_API_KEY is canonical; provider-specific names are accepted as a convenience. */
function rawAiKey(): string | undefined {
  return process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || undefined;
}

export const serverEnv = {
  get aiProvider(): AiProviderName {
    const value = process.env.AI_PROVIDER ?? "gemini";
    if (value !== "gemini" && value !== "openai") {
      throw new Error(`AI_PROVIDER must be "gemini" or "openai", got "${value}"`);
    }
    return value;
  },
  get aiApiKey() {
    return required("AI_API_KEY", rawAiKey());
  },
  get aiModel() {
    return process.env.AI_MODEL ?? (this.aiProvider === "gemini" ? "gemini-3.6-flash" : "gpt-4o-mini");
  },
  /** True when an AI key is configured; used to show a friendly "not configured" state instead of crashing. */
  get aiConfigured() {
    return Boolean(rawAiKey());
  },
  get newsApiKey(): string | undefined {
    return process.env.NEWS_API_KEY || undefined;
  },
  get newsFeedUrls(): string[] {
    return (process.env.NEWS_FEED_URLS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  },
};
