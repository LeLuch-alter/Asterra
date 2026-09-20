import Link from "next/link";
import { Map, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagList } from "@/components/shared/tag-list";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ArchiveProjectButton } from "@/components/project/archive-project-button";
import { getProjectContext } from "@/lib/supabase/queries/project-context";
import { getProjectMembers } from "@/lib/supabase/queries/projects";
import { getRoadmap } from "@/lib/supabase/queries/roadmap";
import { formatDate } from "@/lib/format";
import { MEMBER_ROLE_LABELS } from "@/types";

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold">{title}</h3>
      <p className="whitespace-pre-line text-sm text-muted-foreground">{text || "Not written yet."}</p>
    </div>
  );
}

function ToolLink({ href, icon: Icon, title, subtitle }: { href: string; icon: typeof Map; title: string; subtitle: string }) {
  return (
    <Button asChild variant="outline" className="h-auto justify-start py-3">
      <Link href={href}>
        <Icon className="text-primary" />
        <span className="text-left">
          <span className="block font-medium">{title}</span>
          <span className="block text-xs text-muted-foreground">{subtitle}</span>
        </span>
      </Link>
    </Button>
  );
}

export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { project, isMember, isOwner } = await getProjectContext(id);
  const [members, roadmap] = await Promise.all([getProjectMembers(id), getRoadmap(id)]);
  const done = roadmap.filter((r) => r.status === "done").length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <Section title="Description" text={project.description} />
            <Section title="Research question" text={project.research_question} />
            <Section title="Hypothesis" text={project.hypothesis} />
            <Section title="Methodology" text={project.methodology} />
            {project.required_skills.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Required skills</h3>
                <TagList tags={project.required_skills} max={20} />
              </div>
            )}
          </CardContent>
        </Card>

        {isMember && (
          <Card>
            <CardHeader>
              <CardTitle>AI tools</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <ToolLink
                href={`/projects/${id}/roadmap`}
                icon={Map}
                title="Roadmap"
                subtitle={roadmap.length ? `${done}/${roadmap.length} steps done` : "Generate a plan"}
              />
              <ToolLink href={`/projects/${id}/match`} icon={Users} title="AI Match" subtitle="Find collaborators" />
              <ToolLink href={`/projects/${id}/assistant`} icon={Sparkles} title="Assistant" subtitle="Summarize & review" />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid content-start gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>Created {formatDate(project.created_at)}</p>
            <p>Updated {formatDate(project.updated_at)}</p>
            {isOwner && project.status !== "archived" && <ArchiveProjectButton projectId={id} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
