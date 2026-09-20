import Link from "next/link";
import { Lock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectNav } from "@/components/project/project-nav";
import { BookmarkButton } from "@/components/project/bookmark-button";
import { JoinRequestButton } from "@/components/project/join-request-button";
import { getProjectContext } from "@/lib/supabase/queries/project-context";
import { getBookmarkedIds, getMyJoinRequest } from "@/lib/supabase/queries/social";
import { PROJECT_STATUS_LABELS } from "@/types";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { project, isMember, user } = await getProjectContext(id);
  const [bookmarked, joinRequest] = await Promise.all([
    getBookmarkedIds(user.id),
    isMember ? Promise.resolve(null) : getMyJoinRequest(id, user.id),
  ]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow eyebrow-accent mb-2 flex flex-wrap items-center gap-x-2">
            {project.research_field || "Project"}
            <span className="text-border">/</span>
            <span className="text-muted-foreground">{PROJECT_STATUS_LABELS[project.status]}</span>
            {project.visibility === "private" && (
              <>
                <span className="text-border">/</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Lock className="size-3" /> Private
                </span>
              </>
            )}
          </p>
          <h1 className="display text-4xl sm:text-5xl">{project.title}</h1>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <BookmarkButton projectId={project.id} bookmarked={bookmarked.has(project.id)} />
          {isMember ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/projects/${project.id}/edit`}>
                <Pencil />
                Edit
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
