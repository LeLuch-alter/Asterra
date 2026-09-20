import { z } from "zod";

/** "python, machine learning , R" -> ["python", "machine learning", "R"] */
export const tagList = z
  .string()
  .default("")
  .transform((s) =>
    Array.from(new Set(s.split(",").map((t) => t.trim()).filter(Boolean))).slice(0, 30),
  );

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(80),
  bio: z.string().trim().max(1000, "Bio is too long").default(""),
  organization: z.string().trim().max(120).default(""),
  role: z.enum(["student", "researcher", "mentor"]),
  research_fields: tagList,
  skills: tagList,
  interests: tagList,
  experience_years: z.coerce.number().int().min(0).max(60).default(0),
  is_mentor: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.undefined()])
    .transform((v) => v === "on" || v === "true"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
