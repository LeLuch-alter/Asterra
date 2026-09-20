import type { z } from "zod";
import type { ActionResult } from "@/types";

/** Parses a FormData object with a zod schema and returns a typed ActionResult on failure. */
export function parseForm<S extends z.ZodType>(
  schema: S,
  formData: FormData,
): { ok: true; data: z.output<S> } | (ActionResult & { ok: false }) {
  const raw: Record<string, FormDataEntryValue> = {};
  formData.forEach((value, key) => {
    raw[key] = value;
  });
  const result = schema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "form");
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }
  return { ok: true, data: result.data };
}
