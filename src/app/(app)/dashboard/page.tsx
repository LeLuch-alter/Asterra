import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, FolderKanban, Plus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ProjectCard } from "@/components/project/project-card";
import { requireUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries/profiles";
import { getMyProjects, searchProjects } from "@/lib/supabase/queries/projects";
import { getBookmarkedIds, getMyConnections } from "@/lib/supabase/queries/social";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const [profile, mine, recent, bookmarked, connections] = await Promise.all([
    getProfile(user.id),
    getMyProjects(user.id),
    searchProjects({}, 6),
    getBookmarkedIds(user.id),
    getMyConnections(user.id),
  ]);
  const others = recent.filter((p) => !mine.some((m) => m.id === p.id));
  const profileIncomplete = profile && profile.research_fields.length === 0 && profile.skills.length === 0;
  const firstName = profile?.full_name?.split(" ")[0] || "researcher";

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={
          <>
            Hello, <em>{firstName}.</em>
          </>
        }
        description="Your projects, your network and what is new on Asterra."
        actions={
          <Button asChild>
            <Link href="/projects/new">
              <Plus />
              New project
            </Link>
          </Button>
        }
      />

      <dl className="mb-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        {[
          ["Projects", mine.length, "/projects"],
          ["Connections", connections.accepted.length, "/connections"],
          ["Requests", connections.incoming.length, "/connections"],
          ["Saved", bookmarked.size, "/bookmarks"],
        ].map(([label, value, href]) => (
          <Link key={label} href={href as string} className="border-l pl-4 transition-colors hover:border-primary">
            <dd className="display text-3xl">{value}</dd>
            <dt className="mt-1 text-xs text-muted-foreground">{label}</dt>
          </Link>
        ))}
      </dl>

      {profileIncomplete && (
        <div className="mb-10 flex flex-col gap-3 rounded-xl border border-primary/30 bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Complete your researcher profile</p>
            <p className="text-sm text-muted-foreground">Add research fields and skills so AI Match can recommend you to projects.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/profile">
              <UserRound />
              Edit profile
            </Link>
          </Button>
        </div>
      )}

      <section className="mb-12">
        <p className="eyebrow mb-3">My projects · {mine.length}</p>
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
              <ProjectCard key={p.id} project={p} bookmarked={bookmarked.has(p.id)} />
            ))}
          </div>
        )}
      </section>

      {others.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="eyebrow">Recently updated on Asterra</p>
            <Button asChild variant="ghost" size="sm">
              <Link href="/projects">
                Browse all
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <ProjectCard key={p.id} project={p} bookmarked={bookmarked.has(p.id)} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
