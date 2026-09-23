import Link from "next/link";
import type { Metadata } from "next";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ProjectCard } from "@/components/project/project-card";
import { requireUser } from "@/lib/supabase/server";
import { getBookmarkedProjects } from "@/lib/supabase/queries/social";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Saved projects" };

export default async function BookmarksPage() {
  const user = await requireUser();
  const projects = await getBookmarkedProjects(user.id);
  const t = await getT();

  return (
    <>
      <PageHeader eyebrow={t("Reading list")} title={t("Saved projects")} description={t("Projects you bookmarked to come back to later.")} />
      {projects.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title={t("Nothing saved yet")}
          description={t("Use the Save button on a project to keep it here.")}
          action={
            <Button asChild>
              <Link href="/projects">{t("Discover projects")}</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} bookmarked />
          ))}
        </div>
      )}
    </>
  );
}
