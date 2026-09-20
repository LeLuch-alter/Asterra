import Link from "next/link";
import type { Metadata } from "next";
import { FolderSearch, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { ProjectCard } from "@/components/project/project-card";
import { searchProjects } from "@/lib/supabase/queries/projects";
import { PROJECT_STATUS_LABELS, RESEARCH_FIELDS } from "@/types";

export const metadata: Metadata = { title: "Projects" };

type Search = { q?: string; field?: string; status?: string; skill?: string };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const filters = await searchParams;
  const projects = await searchProjects(filters);
  const hasFilters = Boolean(filters.q || filters.field || filters.status || filters.skill);

  return (
    <>
      <PageHeader
        title="Discover projects"
        description="Find research projects by topic, field or required skills."
        actions={
          <Button asChild>
            <Link href="/projects/new">
              <Plus />
              New project
            </Link>
          </Button>
        }
      />
      <SearchFilterBar
        action="/projects"
        q={filters.q}
        placeholder="Search by title, description or research question"
        selects={[
          {
            name: "field",
            placeholder: "All fields",
            value: filters.field,
            options: RESEARCH_FIELDS.map((f) => ({ value: f, label: f })),
          },
          {
            name: "status",
            placeholder: "Any status",
            value: filters.status,
            options: Object.entries(PROJECT_STATUS_LABELS)
              .filter(([v]) => v !== "archived")
              .map(([value, label]) => ({ value, label })),
          },
        ]}
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderSearch}
          title={hasFilters ? "No projects match these filters" : "No projects yet"}
          description={hasFilters ? "Try a broader search." : "Be the first to create a research project."}
          action={
            hasFilters ? (
              <Button asChild variant="outline">
                <Link href="/projects">Clear filters</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/projects/new">Create project</Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </>
  );
}
