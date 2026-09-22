import Link from "next/link";
import { FlaskConical, GitFork, History, Library, Map, Network, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TagList } from "@/components/shared/tag-list";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ArchiveProjectButton } from "@/components/project/archive-project-button";
import { getProjectContext } from "@/lib/supabase/queries/project-context";
import { getProjectMembers } from "@/lib/supabase/queries/projects";
import { getRoadmap } from "@/lib/supabase/queries/roadmap";
import { getExperiments, getForkInfo, getRelatedProjects, getSources, getVersions } from "@/lib/supabase/queries/graph";
import { formatDate } from "@/lib/format";
import { MEMBER_ROLE_LABELS, SOURCE_TARGET_LABELS, type ResearchFieldName, type ResearchSource } from "@/types";

/** One part of the idea spine: text + version badge + the sources that support it. */
function IdeaSection({
  title,
  text,
  field,
  versions,
  sources,
  projectId,
}: {
  title: string;
  text: string;
  field: ResearchFieldName;
  versions: { field: string; version: number }[];
  sources: ResearchSource[];
  projectId: string;
}) {
  const latest = versions.filter((v) => v.field === field).reduce((max, v) => Math.max(max, v.version), 1);
  const supporting = sources.filter((s) => s.target_type === field);

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {latest > 1 && (
          <Link href={`/projects/${projectId}/timeline`}>
            <Badge variant="outline" className="font-mono text-[10px]">
              v{latest} · history
            </Badge>
          </Link>
        )}
      </div>
      <p className="whitespace-pre-line text-sm text-muted-foreground">{text || "Not written yet."}</p>
      {supporting.length > 0 && (
        <ul className="mt-2 grid gap-1">
          {supporting.map((s) => (
            <li key={s.id} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Library className="mt-0.5 size-3 shrink-0" />
              <span>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer" className="hover:underline">
                    {s.title}
                  </a>
                ) : (
                  s.title
                )}
                {s.note && <span className="text-muted-foreground/70"> — {s.note}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ToolLink({ href, icon: Icon, title, subtitle }: { href: string; icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <Button asChild variant="outline" className="h-auto justify-start py-3">
      <Link href={href}>
        <Icon className="text-primary" />
        <span className="text-left">
          <span className="block font-medium">{title}</span>
          <span className="block text-xs font-normal text-muted-foreground">{subtitle}</span>
        </span>
      </Link>
    </Button>
  );
}

export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { project, isMember, isOwner } = await getProjectContext(id);
  const [members, roadmap, versions, sources, experiments, forkInfo, related] = await Promise.all([
    getProjectMembers(id),
    getRoadmap(id),
    getVersions(id),
    getSources(id),
    getExperiments(id),
    getForkInfo(project),
    getRelatedProjects(project, 4),
  ]);
  const done = roadmap.filter((r) => r.status === "done").length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="grid gap-6">
        {/* The research map is the entry point, not an afterthought. */}
        <Link
          href={`/projects/${id}/graph`}
          className="flex items-center gap-4 rounded-xl border border-primary/30 bg-card p-5 transition-colors hover:border-primary"
        >
          <Network className="size-6 shrink-0 text-primary" />
          <span>
            <span className="block font-medium">Open the research graph</span>
            <span className="block text-sm text-muted-foreground">
              See how the question, hypothesis, methods, experiments, results, people and sources connect.
            </span>
          </span>
        </Link>

        <section className="rounded-xl border bg-card p-6">
          <p className="eyebrow mb-4">Overview</p>
          <div className="grid gap-5">
            <div>
              <h3 className="mb-1 text-sm font-semibold">Description</h3>
              <p className="whitespace-pre-line text-sm text-muted-foreground">{project.description || "Not written yet."}</p>
            </div>
            <IdeaSection
              title="Research question"
              text={project.research_question}
              field="research_question"
              versions={versions}
              sources={sources}
              projectId={id}
            />
            <IdeaSection
              title="Hypothesis"
              text={project.hypothesis}
              field="hypothesis"
              versions={versions}
              sources={sources}
              projectId={id}
            />
            <IdeaSection
              title="Methodology"
              text={project.methodology}
              field="methodology"
              versions={versions}
              sources={sources}
              projectId={id}
            />
            {project.required_skills.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Required skills</h3>
                <TagList tags={project.required_skills} max={20} />
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6">
          <p className="eyebrow mb-4">Research workspace</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <ToolLink
              href={`/projects/${id}/roadmap`}
              icon={Map}
              title="Roadmap"
              subtitle={roadmap.length ? `${done}/${roadmap.length} steps done` : "Generate a plan"}
            />
            <ToolLink
              href={`/projects/${id}/experiments`}
              icon={FlaskConical}
              title="Experiments"
              subtitle={experiments.length ? `${experiments.length} recorded` : "None yet"}
            />
            <ToolLink
              href={`/projects/${id}/sources`}
              icon={Library}
              title="Sources"
              subtitle={sources.length ? `${sources.length} attached` : "None yet"}
            />
            <ToolLink href={`/projects/${id}/timeline`} icon={History} title="Timeline" subtitle="How it evolved" />
            {isMember && <ToolLink href={`/projects/${id}/match`} icon={Users} title="AI Match" subtitle="Find collaborators" />}
            {isMember && <ToolLink href={`/projects/${id}/assistant`} icon={Sparkles} title="Assistant" subtitle="Summarize & review" />}
          </div>
        </section>
      </div>

      <div className="grid content-start gap-6">
        <section className="rounded-xl border bg-card p-5">
          <p className="eyebrow mb-3">Team</p>
          <div className="grid gap-3">
            {members.map((m) => (
              <Link key={m.user_id} href={`/researchers/${m.user_id}`} className="flex items-center gap-3">
                <UserAvatar name={m.profile.full_name} src={m.profile.avatar_url} className="size-8" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{m.profile.full_name}</span>
                  <span className="block text-xs text-muted-foreground">{MEMBER_ROLE_LABELS[m.role]}</span>
                </span>
              </Link>
            ))}
            <Button asChild variant="ghost" size="sm" className="justify-start">
              <Link href={`/projects/${id}/team`}>View team</Link>
            </Button>
          </div>
        </section>

        {(forkInfo.parent || forkInfo.forks.length > 0) && (
          <section className="rounded-xl border bg-card p-5">
            <p className="eyebrow mb-3 flex items-center gap-1.5">
              <GitFork className="size-3.5" /> Research branches
            </p>
            <ul className="grid gap-2 text-sm">
              {forkInfo.parent && (
                <li>
                  <span className="text-xs text-muted-foreground">Forked from</span>
                  <br />
                  <Link href={`/projects/${forkInfo.parent.id}`} className="hover:underline">
                    {forkInfo.parent.title}
                  </Link>
                </li>
              )}
              {forkInfo.forks.map((f) => (
                <li key={f.id}>
                  <span className="text-xs text-muted-foreground">Branch</span>
                  <br />
                  <Link href={`/projects/${f.id}`} className="hover:underline">
                    {f.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="rounded-xl border bg-card p-5">
            <p className="eyebrow mb-3">Related research</p>
            <ul className="grid gap-2 text-sm">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/projects/${r.id}`} className="hover:underline">
                    {r.title}
                  </Link>
                  <span className="block text-xs text-muted-foreground">{r.research_field}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {sources.length > 0 && (
          <section className="rounded-xl border bg-card p-5">
            <p className="eyebrow mb-3">Evidence · {sources.length}</p>
            <ul className="grid gap-2 text-sm">
              {sources.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <span className="line-clamp-1">{s.title}</span>
                  <span className="text-xs text-muted-foreground">supports {SOURCE_TARGET_LABELS[s.target_type].toLowerCase()}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="ghost" size="sm" className="mt-2 justify-start">
              <Link href={`/projects/${id}/sources`}>All sources</Link>
            </Button>
          </section>
        )}

        <section className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
          <p>Created {formatDate(project.created_at)}</p>
          <p>Updated {formatDate(project.updated_at)}</p>
          {isOwner && project.status !== "archived" && <ArchiveProjectButton projectId={id} />}
        </section>
      </div>
    </div>
  );
}
