import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectForm } from "@/components/project/project-form";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={t("Create a research project")}
        description={t("Start with a title and a short description — you can generate a roadmap and add the rest later.")}
      />
      <ProjectForm />
    </div>
  );
}
