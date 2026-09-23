import Link from "next/link";
import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/layout/search-box";
import { EmptyState } from "@/components/shared/empty-state";
import { ProjectCard } from "@/components/project/project-card";
import { ResearcherCard } from "@/components/researcher/researcher-card";
import { ConnectButton } from "@/components/researcher/connect-button";
import { requireUser } from "@/lib/supabase/server";
import { searchProfiles } from "@/lib/supabase/queries/profiles";
import { searchProjects } from "@/lib/supabase/queries/projects";
import { getBookmarkedIds, getConnectionStates } from "@/lib/supabase/queries/social";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const user = await requireUser();
  const query = q.trim();

  const [people, projects, bookmarked] = query
    ? await Promise.all([searchProfiles({ q: query }, 12), searchProjects({ q: query }, 12), getBookmarkedIds(user.id)])
    : [[], [], new Set<string>()];
  const states = await getConnectionStates(
    user.id,
    people.map((p) => p.id),
  );
  const total = people.length + projects.length;
  const t = await getT();

  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow mb-2">{t("Search")}</p>
      <h1 className="display text-4xl sm:text-5xl">
        {query ? (
          <>
            {t("Results for")} <em>“{query}”</em>
          </>
        ) : (
          t("Find people and projects")
        )}
      </h1>
      <SearchBox className="mt-6 max-w-xl" defaultValue={query} autoFocus={!query} />
      {query && <p className="mt-3 text-sm text-muted-foreground">{t("{count} results", { count: total })}</p>}

      {query && total === 0 && (
        <EmptyState
          icon={SearchX}
          className="mt-8"
          title={t("Nothing found")}
          description={t("Try a name, an organization, a research field or a project keyword.")}
          action={
            <Button asChild variant="outline">
              <Link href="/researchers">{t("Browse all researchers")}</Link>
            </Button>
          }
        />
      )}

      {people.length > 0 && (
        <section className="mt-10">
          <p className="eyebrow mb-3">{t("People")} · {people.length}</p>
          <div className="grid gap-4 md:grid-cols-2">
            {people.map((p) => (
              <ResearcherCard key={p.id} profile={p} action={<ConnectButton otherId={p.id} state={states[p.id] ?? { kind: "none" }} />} />
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="mt-10">
          <p className="eyebrow mb-3">{t("Projects")} · {projects.length}</p>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} bookmarked={bookmarked.has(p.id)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
