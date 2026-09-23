/**
 * Interface localisation.
 *
 * Keys are the English source strings, so any string that has not been
 * translated yet simply renders in English instead of showing a missing key.
 * Research content itself (projects, results, AI output) stays in English —
 * only the interface changes language.
 */
export const LOCALES = ["en", "ru", "kk"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  kk: "Қазақша",
};

/** Short label for the switcher button. */
export const LOCALE_SHORT: Record<Locale, string> = { en: "EN", ru: "RU", kk: "KK" };

/** BCP 47 tags used for dates and relative times. */
export const LOCALE_TAGS: Record<Locale, string> = { en: "en-GB", ru: "ru-RU", kk: "kk-KZ" };

export const LOCALE_COOKIE = "asterra_locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export type Dictionary = Record<string, string>;

/** Replaces `{name}` placeholders in a translated string. */
export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

/** Builds the `t()` function used by both server and client components. */
export function createTranslator(dict: Dictionary) {
  return function t(key: string, vars?: Record<string, string | number>): string {
    return interpolate(dict[key] ?? key, vars);
  };
}

export type Translator = ReturnType<typeof createTranslator>;
