import type { Tables } from "./database";

export type {
  UserRole,
  ProjectStatus,
  ProjectVisibility,
  MemberRole,
  RoadmapStatus,
} from "./database";

export type { ConnectionStatus, JoinRequestStatus, InvitationStatus } from "./database";

export type Connection = Tables<"connections">;
export type JoinRequest = Tables<"project_join_requests">;
export type Bookmark = Tables<"bookmarks">;
export type ProjectInvitation = Tables<"project_invitations">;

/** How the current user relates to another profile (drives the Connect button). */
export type ConnectionState =
  | { kind: "none" }
  | { kind: "self" }
  | { kind: "outgoing"; id: string }
  | { kind: "incoming"; id: string }
  | { kind: "connected"; id: string };

export type ProfileLite = Pick<Profile, "id" | "full_name" | "avatar_url" | "organization" | "role">;

export type Profile = Tables<"profiles">;
export type Project = Tables<"projects">;
export type ProjectMember = Tables<"project_members">;
export type ResearchResult = Tables<"research_results">;
export type RoadmapItem = Tables<"research_roadmap_items">;
export type NewsItem = Tables<"news_items">;
export type Notification = Tables<"notifications">;

/** A member row joined with its profile — what the UI usually needs. */
export type ProjectMemberWithProfile = ProjectMember & { profile: Profile };

/** A research result joined with its author. */
export type ResearchResultWithAuthor = ResearchResult & { author: Pick<Profile, "id" | "full_name" | "avatar_url"> };

/** Project card data: project + owner + member count. */
export type ProjectSummary = Project & {
  owner: Pick<Profile, "id" | "full_name" | "avatar_url">;
  member_count: number;
};

/** Result of a Server Action: either ok or a form-level / field-level error. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/** The AI Match output shape shown in the UI (validated by lib/ai/schemas). */
export type MatchCandidate = {
  candidate: Pick<Profile, "id" | "full_name" | "avatar_url" | "organization" | "role" | "skills" | "research_fields">;
  score: number;
  summary: string;
  overlapping_skills: string[];
  overlapping_fields: string[];
  experience_note: string;
};

/** Constant lists used by forms and filters. */
export const RESEARCH_FIELDS = [
  "Computer Science",
  "Artificial Intelligence",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Astronomy",
  "Environmental Science",
  "Medicine",
  "Neuroscience",
  "Economics",
  "Psychology",
  "Engineering",
  "Materials Science",
  "Social Sciences",
] as const;

export const PROJECT_STATUS_LABELS: Record<Tables<"projects">["status"], string> = {
  idea: "Idea",
  planning: "Planning",
  in_progress: "In progress",
  completed: "Completed",
  archived: "Archived",
};

export const USER_ROLE_LABELS: Record<Tables<"profiles">["role"], string> = {
  student: "Student",
  researcher: "Researcher",
  mentor: "Mentor",
};

export const MEMBER_ROLE_LABELS: Record<Tables<"project_members">["role"], string> = {
  owner: "Owner",
  researcher: "Researcher",
  mentor: "Mentor",
  contributor: "Contributor",
};
