import { z } from "zod";

/**
 * Zod schemas for every AI response. Model output is never used in the UI
 * without passing through one of these.
 */

// ---------- AI Research Roadmap ----------
export const roadmapResponseSchema = z.object({
  steps: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(200),
        description: z.string().trim().max(2000).default(""),
      }),
    )
    .min(3)
    .max(20),
});
export type RoadmapResponse = z.infer<typeof roadmapResponseSchema>;

export const roadmapJsonSchema = {
  type: "object",
  properties: {
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "description"],
      },
    },
  },
  required: ["steps"],
};

// ---------- AI Match ----------
export const matchResponseSchema = z.object({
  matches: z
    .array(
      z.object({
        candidate_id: z.string().min(1),
        score: z.number().min(0).max(100),
        summary: z.string().trim().min(1).max(600),
        overlapping_skills: z.array(z.string()).default([]),
        overlapping_fields: z.array(z.string()).default([]),
        experience_note: z.string().trim().max(400).default(""),
      }),
    )
    .max(10),
});
export type MatchResponse = z.infer<typeof matchResponseSchema>;

export const matchJsonSchema = {
  type: "object",
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          candidate_id: { type: "string" },
          score: { type: "number" },
          summary: { type: "string" },
          overlapping_skills: { type: "array", items: { type: "string" } },
          overlapping_fields: { type: "array", items: { type: "string" } },
          experience_note: { type: "string" },
        },
        required: ["candidate_id", "score", "summary", "overlapping_skills", "overlapping_fields", "experience_note"],
      },
    },
  },
  required: ["matches"],
};

// ---------- AI Research Assistant ----------
export const assistantOperations = ["summarize", "explain", "review", "suggest_questions", "improve"] as const;
export type AssistantOperation = (typeof assistantOperations)[number];

export const assistantResponseSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(6000),
  points: z.array(z.string().trim().min(1).max(500)).max(15).default([]),
});
export type AssistantResponse = z.infer<typeof assistantResponseSchema>;

export const assistantJsonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    content: { type: "string" },
    points: { type: "array", items: { type: "string" } },
  },
  required: ["title", "content", "points"],
};
