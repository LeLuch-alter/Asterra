import { cookies } from "next/headers";
import { createTranslator, DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale, type Translator } from "./config";
import { DICTIONARIES } from "./dictionaries";

/** The interface language for this request, taken from the language cookie. */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** `t()` for server components. */
export async function getT(): Promise<Translator> {
  return createTranslator(DICTIONARIES[await getLocale()]);
}
