"use client";

import { createContext, useContext, useMemo } from "react";
import { createTranslator, DEFAULT_LOCALE, type Locale, type Translator } from "./config";
import { DICTIONARIES } from "./dictionaries";

type LocaleContextValue = { locale: Locale; t: Translator };

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  t: createTranslator({}),
});

/**
 * Makes the chosen interface language available to client components.
 * The dictionaries are small plain objects, so they ship with the bundle and
 * no request is needed when the language changes.
 */
export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, t: createTranslator(DICTIONARIES[locale]) }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** `t()` for client components. */
export function useT(): Translator {
  return useContext(LocaleContext).t;
}

export function useLocale(): Locale {
  return useContext(LocaleContext).locale;
}
