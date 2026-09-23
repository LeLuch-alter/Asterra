import Link from "next/link";
import { Users } from "lucide-react";
import { TagList } from "@/components/shared/tag-list";
import { UserAvatar } from "@/components/shared/user-avatar";
import { timeAgo } from "@/lib/format";
import { PROJECT_STATUS_LABELS, type ProjectSummary } from "@/types";
import { getLocale, getT } from "@/lib/i18n/server";
import { BookmarkButton } from "./bookmark-button";

type Props = { project: ProjectSummary; bookmarked?: boolean };

export async function ProjectCard({ project, bookmarked }: Props) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return (
    <article className="flex h-full flex-col rounded-xl border bg-card p-5 transition-colors hover:border-foreground/30">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow eyebrow-accent flex flex-wrap gap-x-2">
          {project.research_field || t("Project")}
          <span className="text-border">/</span>
          <span className="text-muted-foreground">{t(PROJECT_STATUS_LABELS[project.status])}</span>
        </p>
        {bookmarked !== undefined && <BookmarkButton projectId={project.id} bookmarked={bookmarked} label={false} />}
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight">
        <Link href={`/projects/${project.id}`} className="hover:underline">
          {project.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{project.description || t("No description yet.")}</p>
      {project.required_skills.length > 0 && (
        <div className="mt-4">
          <TagList tags={project.required_skills} max={4} variant="outline" />
        </div>
      )}
      <footer className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
        <span className="flex min-w-0 items-center gap-2">
          <UserAvatar name={project.owner.full_name} src={project.owner.avatar_url} className="size-6" />
          <span className="truncate">{project.owner.full_name}</span>
        </span>
        <span className="flex shrink-0 items-center gap-3 font-mono">
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {project.member_count}
          </span>
          <span>{timeAgo(project.updated_at, locale)}</span>
        </span>
      </footer>
    </article>
  );
}
