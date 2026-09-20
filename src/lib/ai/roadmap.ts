import "server-only";
import type { Project } from "@/types";
import { generateJson } from "./provider";
import { roadmapJsonSchema, roadmapResponseSchema, type RoadmapResponse } from "./schemas";
import { roadmapPrompt, roadmapSystem } from "./prompts";

/** Generates an editable roadmap draft. Nothing is saved here; the user saves via actions/roadmap. */
export async function generateRoadmap(project: Project): Promise<RoadmapResponse> {
  return generateJson({
    system: roadmapSystem,
    prompt: roadmapPrompt(project),
    schema: roadmapResponseSchema,
    jsonSchema: roadmapJsonSchema,
  });
}
