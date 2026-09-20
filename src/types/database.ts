/**
 * Database types matching supabase/migrations/0001_init.sql.
 *
 * Hand-written in the same shape `supabase gen types typescript` produces,
 * so it can be regenerated later with:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "student" | "researcher" | "mentor";
export type ProjectStatus = "idea" | "planning" | "in_progress" | "completed" | "archived";
export type ProjectVisibility = "public" | "private";
export type MemberRole = "owner" | "researcher" | "mentor" | "contributor";
export type RoadmapStatus = "todo" | "in_progress" | "done";

type ProfileRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
  organization: string;
  role: UserRole;
  research_fields: string[];
  skills: string[];
  interests: string[];
  experience_years: number;
  is_mentor: boolean;
  created_at: string;
  updated_at: string;
};

type ProjectRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  research_field: string;
  research_question: string;
  hypothesis: string;
  methodology: string;
  required_skills: string[];
  status: ProjectStatus;
  visibility: ProjectVisibility;
  created_at: string;
  updated_at: string;
};

type ProjectMemberRow = {
  project_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
};

type ResearchResultRow = {
  id: string;
  project_id: string;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type RoadmapItemRow = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  position: number;
  status: RoadmapStatus;
  created_at: string;
};

type MatchResultRow = {
  id: string;
  project_id: string;
  candidate_id: string;
  score: number;
  reasons: Json;
  created_at: string;
};

type NewsItemRow = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  image_url: string | null;
  published_at: string;
};

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  payload: Json;
  read_at: string | null;
  created_at: string;
};

export type ConnectionStatus = "pending" | "accepted";
export type JoinRequestStatus = "pending" | "accepted" | "declined";

type ConnectionRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: ConnectionStatus;
  created_at: string;
  responded_at: string | null;
};

type JoinRequestRow = {
  id: string;
  project_id: string;
  user_id: string;
  message: string;
  status: JoinRequestStatus;
  created_at: string;
  responded_at: string | null;
};

type BookmarkRow = {
  user_id: string;
  project_id: string;
  created_at: string;
};

/** Makes generated/defaulted columns optional for inserts. */
type Insertable<Row, Generated extends keyof Row> = Omit<Row, Generated> & Partial<Pick<Row, Generated>>;

type Table<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        Insertable<
          ProfileRow,
          | "avatar_url"
          | "bio"
          | "organization"
          | "role"
          | "research_fields"
          | "skills"
          | "interests"
          | "experience_years"
          | "is_mentor"
          | "created_at"
          | "updated_at"
          | "full_name"
        >
      >;
      projects: Table<
        ProjectRow,
        Insertable<
          ProjectRow,
          | "id"
          | "description"
          | "research_field"
          | "research_question"
          | "hypothesis"
          | "methodology"
          | "required_skills"
          | "status"
          | "visibility"
          | "created_at"
          | "updated_at"
        >
      >;
      project_members: Table<ProjectMemberRow, Insertable<ProjectMemberRow, "role" | "joined_at">>;
      research_results: Table<
        ResearchResultRow,
        Insertable<ResearchResultRow, "id" | "content" | "created_at" | "updated_at">
      >;
      research_roadmap_items: Table<
        RoadmapItemRow,
        Insertable<RoadmapItemRow, "id" | "description" | "position" | "status" | "created_at">
      >;
      match_results: Table<MatchResultRow, Insertable<MatchResultRow, "id" | "reasons" | "created_at">>;
      news_items: Table<
        NewsItemRow,
        Insertable<NewsItemRow, "id" | "summary" | "source" | "category" | "image_url" | "published_at">
      >;
      notifications: Table<NotificationRow, Insertable<NotificationRow, "id" | "payload" | "read_at" | "created_at">>;
      connections: Table<ConnectionRow, Insertable<ConnectionRow, "id" | "status" | "created_at" | "responded_at">>;
      project_join_requests: Table<
        JoinRequestRow,
        Insertable<JoinRequestRow, "id" | "message" | "status" | "created_at" | "responded_at">
      >;
      bookmarks: Table<BookmarkRow, Insertable<BookmarkRow, "created_at">>;
    };
    Views: Record<string, never>;
    Functions: {
      is_project_member: { Args: { p_project_id: string }; Returns: boolean };
      is_project_owner: { Args: { p_project_id: string }; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      project_status: ProjectStatus;
      project_visibility: ProjectVisibility;
      member_role: MemberRole;
      roadmap_status: RoadmapStatus;
      connection_status: ConnectionStatus;
      join_request_status: JoinRequestStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
