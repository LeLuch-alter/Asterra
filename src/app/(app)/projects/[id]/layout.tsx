import Link from "next/link";
import { GitFork, Lock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectNav } from "@/components/project/project-nav";
import { BookmarkButton } from "@/components/project/bookmark-button";
import { JoinRequestButton } from "@/components/project/join-request-button";
import { ForkDialog } from "@/components/graph/fork-dialog";
import { getProjectContext } from "@/lib/supabase/queries/project-context";
import { getBookmarkedIds, getMyJoinRequest } from "@/lib/supabase/queries/social";
import { getForkInfo } from "@/lib/supabase/queries/graph";
import { PROJECT_STATUS_LABELS } from "@/types";
import { getT } from "@/lib/i18n/server";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { project, isMember, user } = await getProjectContext(id);
  const [bookmarked, joinRequest, forkInfo] = await Promise.all([
    getBookmarkedIds(user.id),
    isMember ? Promise.resolve(null) : getMyJoinRequest(id, user.id),
    getForkInfo(project),
  ]);
  const t = await getT();

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow eyebrow-accent mb-2 flex flex-wrap items-center gap-x-2">
            {project.research_field || t("Project")}
            <span className="text-border">/</span>
            <span className="text-muted-foreground">{t(PROJECT_STATUS_LABELS[project.status])}</span>
            {project.visibility === "private" && (
              <>
                <span className="text-border">/</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Lock className="size-3" /> {t("Private")}
                </span>
              </>
            )}
          </p>
          <h1 className="display text-4xl sm:text-5xl">{project.title}</h1>
          {(forkInfo.parent || forkInfo.forks.length > 0) && (
            <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              <GitFork className="size-3.5" />
              {forkInfo.parent && (
                <>
                  {t("forked from")}{" "}
                  <Link href={`/projects/${forkInfo.parent.id}`} className="text-foreground underline-offset-4 hover:underline">
                    {forkInfo.parent.title}
                  </Link>
                </>
              )}
              {forkInfo.parent && forkInfo.forks.length > 0 && <span className="text-border">·</span>}
              {forkInfo.forks.length > 0 && (
                <>
                  {t(forkInfo.forks.length === 1 ? "{count} fork of this research" : "{count} forks of this research", { count: forkInfo.forks.length })}
                </>
              )}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <BookmarkButton projectId={project.id} bookmarked={bookmarked.has(project.id)} />
          <ForkDialog projectId={project.id} projectTitle={project.title} />
          {isMember ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/projects/${project.id}/edit`}>
                <Pencil />
                {t("Edit")}
              </Link>
            </Button>
          ) : (
            <JoinRequestButton projectId={project.id} projectTitle={project.title} existing={joinRequest?.status ?? null} />
          )}
        </div>
      </div>
      <ProjectNav projectId={project.id} isMember={isMember} />
      <div className="pt-8">{children}</div>
    </>
  );
}
