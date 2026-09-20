import Link from "next/link";
import type { Metadata } from "next";
import { FolderKanban, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ProjectCard } from "@/components/project/project-card";
import { getUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries/profiles";
import { getMyProjects, searchProjects } from "@/lib/supabase/queries/projects";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = (await getUser())!;
  const [profile, mine, recent] = await Promise.all([
    getProfile(user.id),
    getMyProjects(user.id),
    searchProjects({}, 6),
  ]);
  const others = recent.filter((p) => !mine.some((m) => m.id === p.id));
  const profileIncomplete = profile && profile.research_fields.length === 0 && profile.skills.length === 0;

  return (
    <>
      <PageHeader
        title={`Hello, ${profile?.full_name?.split(" ")[0] || "researcher"}`}
        description="Your projects and what is happening on the platform."
        actions={
          <Button asChild>
            <Link href="/projects/new">
              <Plus />
              New project
            </Link>
          </Button>
        }
      />

      {profileIncomplete && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border bg-accent/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Complete your researcher profile</p>
            <p className="text-sm text-muted-foreground">
              Add research fields and skills so AI Match can recommend you to projects.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/profile">
              <Users />
              Edit profile
            </Link>
          </Button>
        </div>
      )}

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">My projects</h2>
        {mine.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first research project and let AI draft a roadmap for it."
            action={
              <Button asChild>
                <Link href="/projects/new">
                  <Plus />
                  Create project
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>

      {others.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recently updated on Asterra</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/projects">Browse all</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
