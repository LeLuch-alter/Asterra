import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectForm } from "@/components/project/project-form";

export const metadata: Metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Create a research project"
        description="Start with a title and a short description — you can generate a roadmap and add the rest later."
      />
      <ProjectForm />
    </div>
  );
}
