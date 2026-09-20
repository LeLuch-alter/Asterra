import { z } from "zod";
import { tagList } from "./profile";

export const projectSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().trim().max(5000).default(""),
  research_field: z.string().trim().min(1, "Choose a research field").max(80),
  research_question: z.string().trim().max(2000).default(""),
  hypothesis: z.string().trim().max(2000).default(""),
  methodology: z.string().trim().max(5000).default(""),
  required_skills: tagList,
  status: z.enum(["idea", "planning", "in_progress", "completed", "archived"]).default("idea"),
  visibility: z.enum(["public", "private"]).default("public"),
});

export const researchResultSchema = z.object({
  title: z.string().trim().min(1, "Enter a title").max(200),
  content: z.string().trim().min(1, "Enter some content").max(20000),
});

export const roadmapItemSchema = z.object({
  title: z.string().trim().min(1, "Enter a title").max(200),
  description: z.string().trim().max(2000).default(""),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
});

export const memberRoleSchema = z.enum(["researcher", "mentor", "contributor"]);

export type ProjectInput = z.infer<typeof projectSchema>;
export type ResearchResultInput = z.infer<typeof researchResultSchema>;
export type RoadmapItemInput = z.infer<typeof roadmapItemSchema>;
