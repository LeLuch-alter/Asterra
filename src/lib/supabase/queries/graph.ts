import { createClient } from "@/lib/supabase/server";
import type {
  Experiment,
  ProfileLite,
  Project,
  ProjectActivity,
  ResearchSource,
  ResearchVersion,
  RoadmapItem,
} from "@/types";

// ---------- Experiments ----------

export type ExperimentWithAuthor = Experiment & { author: ProfileLite };

export async function getExperiments(projectId: string): Promise<ExperimentWithAuthor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("experiments")
    .select("*, author:profiles(id, full_name, avatar_url, organization, role)")
    .eq("project_id", projectId)
    .order("position");
  return (data ?? []) as unknown as ExperimentWithAuthor[];
}

export async function getExperiment(id: string): Promise<Experiment | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("experiments").select("*").eq("id", id).maybeSingle();
  return data;
}

// ---------- Scientific sources ----------

export async function getSources(projectId: string): Promise<ResearchSource[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("research_sources")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

/** Projects (other than this one) that cite the same source URL — "who else uses this paper". */
export async function getProjectsUsingSource(url: string, exceptProjectId: string) {
  if (!url) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("research_sources")
    .select("project:projects(id, title, research_field, visibility)")
    .eq("url", url)
    .neq("project_id", exceptProjectId)
    .limit(10);
  type Row = { project: { id: string; title: string; research_field: string; visibility: string } | null };
  const seen = new Set<string>();
  return ((data ?? []) as unknown as Row[])
    .map((r) => r.project)
    .filter((p): p is NonNullable<Row["project"]> => Boolean(p) && p!.visibility === "public")
    .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
}

// ---------- Version history ----------

export async function getVersions(projectId: string): Promise<ResearchVersion[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("research_versions")
    .select("*")
    .eq("project_id", projectId)
    .order("version", { ascending: false });
  return data ?? [];
}

// ---------- Timeline ----------

export type ActivityWithActor = ProjectActivity & { actor: ProfileLite | null };

export async function getActivity(projectId: string, limit = 100): Promise<ActivityWithActor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_activity")
    .select("*, actor:profiles(id, full_name, avatar_url, organization, role)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as ActivityWithActor[];
}

// ---------- Forks and related projects ----------

export type ProjectRef = { id: string; title: string; research_field: string; owner_name?: string };

export async function getForkInfo(project: Project): Promise<{ parent: ProjectRef | null; forks: ProjectRef[] }> {
  const supabase = await createClient();
  const [parentRes, forksRes] = await Promise.all([
    project.forked_from
      ? supabase.from("projects").select("id, title, research_field").eq("id", project.forked_from).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("projects").select("id, title, research_field").eq("forked_from", project.id).limit(20),
  ]);
  return { parent: (parentRes.data as ProjectRef | null) ?? null, forks: (forksRes.data ?? []) as ProjectRef[] };
}

/** Public projects in the same field, excluding this one — "research nearby". */
export async function getRelatedProjects(project: Project, limit = 6): Promise<ProjectRef[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, title, research_field")
    .eq("visibility", "public")
    .neq("id", project.id)
    .neq("status", "archived")
    .eq("research_field", project.research_field)
    .order("updated_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as ProjectRef[];
}

// ---------- Graph assembly ----------

export type GraphNodeKind =
  | "project"
  | "question"
  | "hypothesis"
  | "methodology"
  | "roadmap"
  | "experiment"
  | "result"
  | "person"
  | "source"
  | "fork"
  | "related";

export type GraphNode = {
  id: string;
  kind: GraphNodeKind;
  label: string;
  /** Short line under the label in the detail panel. */
  meta?: string;
  /** Full text shown when the node is selected. */
  body?: string;
  href?: string;
  /** Extra key/value rows in the detail panel. */
  details?: { label: string; value: string }[];
};

export type GraphEdge = { from: string; to: string; label?: string };

export type ResearchGraph = { nodes: GraphNode[]; edges: GraphEdge[] };

function trim(text: string, max = 60) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

/**
 * Builds the whole research graph for a project: the idea spine
 * (question → hypothesis → methodology → experiments → results),
 * plus people, sources, roadmap steps, forks and related projects.
 */
export async function buildResearchGraph(project: Project): Promise<ResearchGraph> {
  const supabase = await createClient();
  const [membersRes, roadmapRes, resultsRes, experiments, sources, forkInfo, related] = await Promise.all([
    supabase.from("project_members").select("role, profile:profiles(id, full_name, organization, role)").eq("project_id", project.id),
    supabase.from("research_roadmap_items").select("*").eq("project_id", project.id).order("position"),
    supabase.from("research_results").select("*").eq("project_id", project.id).order("created_at"),
    getExperiments(project.id),
    getSources(project.id),
    getForkInfo(project),
    getRelatedProjects(project, 4),
  ]);

  const members = (membersRes.data ?? []) as unknown as { role: string; profile: ProfileLite }[];
  const roadmap = (roadmapRes.data ?? []) as RoadmapItem[];
  const results = (resultsRes.data ?? []) as { id: string; title: string; content: string; experiment_id: string | null; author_id: string }[];

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const add = (n: GraphNode) => nodes.push(n);
  const link = (from: string, to: string, label?: string) => edges.push({ from, to, label });

  // Spine
  add({
    id: "project",
    kind: "project",
    label: trim(project.title, 44),
    meta: project.research_field,
    body: project.description,
    href: `/projects/${project.id}`,
  });
  add({
    id: "question",
    kind: "question",
    label: "Research question",
    meta: trim(project.research_question || "Not written yet", 70),
    body: project.research_question,
  });
  add({ id: "hypothesis", kind: "hypothesis", label: "Hypothesis", meta: trim(project.hypothesis || "Not written yet", 70), body: project.hypothesis });
  add({ id: "methodology", kind: "methodology", label: "Methodology", meta: trim(project.methodology || "Not written yet", 70), body: project.methodology });

  link("project", "question", "asks");
  link("question", "hypothesis", "tests");
  link("hypothesis", "methodology", "via");

  // Roadmap steps hang off the project
  for (const item of roadmap.slice(0, 12)) {
    const id = `roadmap:${item.id}`;
    add({
      id,
      kind: "roadmap",
      label: trim(item.title, 34),
      meta: item.status.replace("_", " "),
      body: item.description,
      href: `/projects/${project.id}/roadmap`,
    });
    link("project", id, "plans");
  }

  // Experiments follow the methodology
  for (const e of experiments) {
    const id = `experiment:${e.id}`;
    add({
      id,
      kind: "experiment",
      label: trim(e.title, 34),
      meta: `${e.status} · ${e.author.full_name}`,
      body: e.purpose,
      href: `/projects/${project.id}/experiments`,
      details: [
        { label: "Purpose", value: e.purpose },
        { label: "Methodology", value: e.methodology },
        { label: "Data", value: e.data_description },
        { label: "Outcome", value: e.outcome },
      ].filter((d) => d.value),
    });
    link("methodology", id, "runs");
    link(`person:${e.author_id}`, id, "ran");
  }

  // Results come from experiments (or from the project when unlinked)
  for (const r of results) {
    const id = `result:${r.id}`;
    add({
      id,
      kind: "result",
      label: trim(r.title, 34),
      body: r.content,
      href: `/projects/${project.id}/results`,
    });
    link(r.experiment_id ? `experiment:${r.experiment_id}` : "methodology", id, "produced");
    link(`person:${r.author_id}`, id, "wrote");
  }

  // People
  for (const m of members) {
    const id = `person:${m.profile.id}`;
    add({
      id,
      kind: "person",
      label: trim(m.profile.full_name, 28),
      meta: `${m.role}${m.profile.organization ? ` · ${m.profile.organization}` : ""}`,
      href: `/researchers/${m.profile.id}`,
    });
    link(id, "project", "contributes to");
  }

  // Sources attach to the part of the research they support
  const targetNodeId = (s: ResearchSource) => {
    switch (s.target_type) {
      case "research_question":
        return "question";
      case "hypothesis":
        return "hypothesis";
      case "methodology":
        return "methodology";
      case "experiment":
        return s.target_id ? `experiment:${s.target_id}` : "methodology";
      case "result":
        return s.target_id ? `result:${s.target_id}` : "project";
      case "roadmap_item":
        return s.target_id ? `roadmap:${s.target_id}` : "project";
      default:
        return "project";
    }
  };
  for (const s of sources) {
    const id = `source:${s.id}`;
    add({
      id,
      kind: "source",
      label: trim(s.title, 34),
      meta: [s.authors, s.year].filter(Boolean).join(" · "),
      body: s.note,
      href: s.url || `/projects/${project.id}/sources`,
      details: [
        { label: "Authors", value: s.authors },
        { label: "Year", value: s.year ? String(s.year) : "" },
        { label: "Supports", value: s.target_type.replace("_", " ") },
      ].filter((d) => d.value),
    });
    link(id, targetNodeId(s), "supports");
  }

  // Forks and related research
  if (forkInfo.parent) {
    const id = `fork:${forkInfo.parent.id}`;
    add({ id, kind: "fork", label: trim(forkInfo.parent.title, 32), meta: "Forked from", href: `/projects/${forkInfo.parent.id}` });
    link(id, "project", "origin of");
  }
  for (const f of forkInfo.forks) {
    const id = `fork:${f.id}`;
    add({ id, kind: "fork", label: trim(f.title, 32), meta: "Fork of this research", href: `/projects/${f.id}` });
    link("project", id, "branched into");
  }
  for (const rp of related) {
    const id = `related:${rp.id}`;
    add({ id, kind: "related", label: trim(rp.title, 32), meta: rp.research_field, href: `/projects/${rp.id}` });
    link("project", id, "related");
  }

  // Drop edges that point at nodes we did not add (e.g. a result by a former member).
  const known = new Set(nodes.map((n) => n.id));
  return { nodes, edges: edges.filter((e) => known.has(e.from) && known.has(e.to)) };
}
