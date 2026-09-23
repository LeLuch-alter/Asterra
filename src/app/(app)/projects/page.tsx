import Link from "next/link";
import type { Metadata } from "next";
import { FolderSearch, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { ProjectCard } from "@/components/project/project-card";
import { requireUser } from "@/lib/supabase/server";
import { searchProjects } from "@/lib/supabase/queries/projects";
import { getBookmarkedIds } from "@/lib/supabase/queries/social";
import { PROJECT_STATUS_LABELS, RESEARCH_FIELDS } from "@/types";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Projects" };

type Search = { q?: string; field?: string; status?: string; skill?: string };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const [filters, user] = await Promise.all([searchParams, requireUser()]);
  const [projects, bookmarked] = await Promise.all([searchProjects(filters), getBookmarkedIds(user.id)]);
  const hasFilters = Boolean(filters.q || filters.field || filters.status || filters.skill);
  const t = await getT();

  return (
    <>
      <PageHeader
        eyebrow={t("Explore")}
        title={t("Research projects")}
        description={t("Find projects by topic, field or required skills. Save the ones you like or ask to join.")}
        actions={
          <Button asChild>
            <Link href="/projects/new">
              <Plus />
              {t("New project")}
            </Link>
          </Button>
        }
      />
      <SearchFilterBar
        action="/projects"
        q={filters.q}
        placeholder={t("Search by title, description or research question")}
        selects={[
          { name: "field", placeholder: t("All fields"), value: filters.field, options: RESEARCH_FIELDS.map((f) => ({ value: f, label: f })) },
          {
            name: "status",
            placeholder: t("Any status"),
            value: filters.status,
            options: Object.entries(PROJECT_STATUS_LABELS)
              .filter(([v]) => v !== "archived")
              .map(([value, label]) => ({ value, label: t(label) })),
          },
        ]}
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderSearch}
          title={hasFilters ? t("No projects match these filters") : t("No projects yet")}
          description={hasFilters ? t("Try a broader search.") : t("Be the first to create a research project.")}
          action={
            hasFilters ? (
              <Button asChild variant="outline">
                <Link href="/projects">{t("Clear filters")}</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/projects/new">{t("Create project")}</Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} bookmarked={bookmarked.has(p.id)} />
          ))}
        </div>
      )}
    </>
  );
}
