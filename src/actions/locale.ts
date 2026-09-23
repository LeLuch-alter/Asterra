"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "@/lib/i18n/config";

/** Stores the chosen interface language for a year and re-renders the app. */
export async function setLocale(value: string): Promise<void> {
  const locale = isLocale(value) ? value : DEFAULT_LOCALE;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
