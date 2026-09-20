import Link from "next/link";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { TagList } from "@/components/shared/tag-list";
import { UserAvatar } from "@/components/shared/user-avatar";
import { timeAgo } from "@/lib/format";
import { PROJECT_STATUS_LABELS, type ProjectSummary } from "@/types";

export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Link href={`/projects/${project.id}`} className="font-semibold leading-snug hover:underline">
            {project.title}
          </Link>
          <Badge variant="outline" className="shrink-0">
            {PROJECT_STATUS_LABELS[project.status]}
          </Badge>
        </div>
        {project.research_field && <p className="text-xs font-medium text-primary">{project.research_field}</p>}
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm text-muted-foreground">{project.description || "No description yet."}</p>
        {project.required_skills.length > 0 && (
          <div className="mt-3">
            <TagList tags={project.required_skills} max={4} variant="outline" />
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <UserAvatar name={project.owner.full_name} src={project.owner.avatar_url} className="size-6" />
          <span className="truncate">{project.owner.full_name}</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {project.member_count}
          </span>
          <span>{timeAgo(project.updated_at)}</span>
        </span>
      </CardFooter>
    </Card>
  );
}
