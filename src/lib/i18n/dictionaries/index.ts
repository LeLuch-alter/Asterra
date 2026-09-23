import type { Dictionary, Locale } from "../config";
import { kk } from "./kk";
import { ru } from "./ru";

/**
 * English is the source language, so it needs no dictionary: `t()` falls back
 * to the key, which is already the English string.
 */
export const DICTIONARIES: Record<Locale, Dictionary> = { en: {}, ru, kk };
