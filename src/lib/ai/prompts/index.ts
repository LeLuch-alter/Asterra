import type { Profile, Project } from "@/types";
import type { AssistantOperation } from "../schemas";

const COMMON_RULES = `You are an assistant inside a scientific collaboration platform for students and researchers.
Your output is assistance, not scientific validation. Never claim a study is valid or correct.
Be concrete, concise and practical. Respond with valid JSON only, no markdown.`;

export function projectContext(project: Project): string {
  return [
    `Title: ${project.title}`,
    `Research field: ${project.research_field || "n/a"}`,
    `Description: ${project.description || "n/a"}`,
    `Research question: ${project.research_question || "n/a"}`,
    `Hypothesis: ${project.hypothesis || "n/a"}`,
    `Methodology: ${project.methodology || "n/a"}`,
    `Required skills: ${project.required_skills.join(", ") || "n/a"}`,
    `Status: ${project.status}`,
  ].join("\n");
}

// ---------- Roadmap ----------
export const roadmapSystem = `${COMMON_RULES}
You create research roadmaps: an ordered list of 6-10 concrete steps a small student team can follow.
Typical stages: research question, hypothesis, literature review, methodology, data collection, data analysis, results, discussion, conclusion.
Adapt the stages to the project. Each description is 1-3 sentences with a practical hint specific to this project.
Output shape: {"steps":[{"title":"...","description":"..."}]}`;

export function roadmapPrompt(project: Project): string {
  return `Create a research roadmap for this project.\n\n${projectContext(project)}`;
}

// ---------- Match ----------
export const matchSystem = `${COMMON_RULES}
You recommend collaborators or mentors for a research project from a list of candidate profiles.
Rank the candidates by fit. Consider research field overlap, skills, interests, experience and relevant previous projects.
Return at most 6 matches, only candidates that are a plausible fit. Use the exact candidate_id values given.
"score" is a rough 0-100 fit estimate, not an objective measurement; "summary" explains WHY in 1-3 sentences.
Output shape: {"matches":[{"candidate_id":"...","score":0,"summary":"...","overlapping_skills":[],"overlapping_fields":[],"experience_note":"..."}]}`;

export type MatchCandidateInput = Pick<
  Profile,
  "id" | "full_name" | "role" | "organization" | "bio" | "research_fields" | "skills" | "interests" | "experience_years" | "is_mentor"
> & { previous_project_fields: string[] };

export function matchPrompt(project: Project, candidates: MatchCandidateInput[], lookingFor: "collaborators" | "mentors"): string {
  const list = candidates
    .map((c) =>
      [
        `candidate_id: ${c.id}`,
        `name: ${c.full_name}`,
        `role: ${c.role}${c.is_mentor ? " (available as mentor)" : ""}`,
        `organization: ${c.organization || "n/a"}`,
        `research fields: ${c.research_fields.join(", ") || "n/a"}`,
        `skills: ${c.skills.join(", ") || "n/a"}`,
        `interests: ${c.interests.join(", ") || "n/a"}`,
        `experience years: ${c.experience_years}`,
        `previous project fields: ${c.previous_project_fields.join(", ") || "n/a"}`,
        `bio: ${c.bio.slice(0, 400) || "n/a"}`,
      ].join("\n"),
    )
    .join("\n\n---\n\n");

  return `We are looking for ${lookingFor} for this project.\n\nPROJECT\n${projectContext(project)}\n\nCANDIDATES\n${list}`;
}

// ---------- Research Assistant ----------
export const assistantSystem = `${COMMON_RULES}
You help researchers understand and improve their own research text. Work only with the provided content.
Output shape: {"title":"...","content":"...","points":["..."]}
- "title": short heading for the response.
- "content": the main answer in plain prose (paragraphs separated by blank lines).
- "points": optional bullet list (specific items, questions or suggestions).`;

const OPERATION_TASKS: Record<AssistantOperation, string> = {
  summarize: "Summarize the text in 3-6 sentences. Put the key findings/claims into 'points'.",
  explain: "Explain the text in simple terms for a student who is new to the field. Define key terms in 'points'.",
  review:
    "Review the structure and clarity. Identify unclear writing, missing sections, weak logic or unsupported claims. Put each concrete issue into 'points'.",
  suggest_questions:
    "Suggest 5-8 specific research questions or follow-up directions that arise from this text. Put them into 'points'.",
  improve:
    "Suggest concrete improvements. In 'content' give a short rationale; in 'points' list actionable edits (what to change and how).",
};

export function assistantPrompt(opts: {
  operation: AssistantOperation;
  project: Project;
  text: string;
  textLabel: string;
}): string {
  return `TASK: ${OPERATION_TASKS[opts.operation]}

PROJECT CONTEXT
${projectContext(opts.project)}

${opts.textLabel.toUpperCase()}
${opts.text}`;
}
