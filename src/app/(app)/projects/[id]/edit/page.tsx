import { redirect } from "next/navigation";
import { ProjectForm } from "@/components/project/project-form";
import { getProjectContext } from "@/lib/supabase/queries/project-context";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { project, isMember } = await getProjectContext(id);
  if (!isMember) redirect(`/projects/${id}`);

  return (
    <div className="mx-auto max-w-3xl">
      <ProjectForm project={project} />
    </div>
  );
}
