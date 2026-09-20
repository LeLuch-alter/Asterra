import Link from "next/link";
import { Lock, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectNav } from "@/components/project/project-nav";
import { getProjectContext } from "@/lib/supabase/queries/project-context";
import { PROJECT_STATUS_LABELS } from "@/types";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { project, isMember } = await getProjectContext(id);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
            <Badge variant="outline">{PROJECT_STATUS_LABELS[project.status]}</Badge>
            {project.visibility === "private" && (
              <Badge variant="secondary">
                <Lock />
                Private
              </Badge>
            )}
          </div>
          {project.research_field && <p className="mt-1 text-sm font-medium text-primary">{project.research_field}</p>}
        </div>
        {isMember && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${project.id}/edit`}>
              <Pencil />
              Edit
            </Link>
          </Button>
        )}
      </div>
      <ProjectNav projectId={project.id} isMember={isMember} />
      <div className="pt-6">{children}</div>
    </>
  );
}
