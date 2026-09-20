import Link from "next/link";
import type { Metadata } from "next";
import { UserSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { ResearcherCard } from "@/components/researcher/researcher-card";
import { searchProfiles } from "@/lib/supabase/queries/profiles";
import { RESEARCH_FIELDS } from "@/types";

export const metadata: Metadata = { title: "Researchers" };

type Search = { q?: string; field?: string; skill?: string; mentors?: string };

export default async function ResearchersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const f = await searchParams;
  const mentorsOnly = f.mentors === "1";
  const profiles = await searchProfiles({ q: f.q, field: f.field, skill: f.skill, mentorsOnly });
  const hasFilters = Boolean(f.q || f.field || f.skill || mentorsOnly);

  return (
    <>
      <PageHeader
        title="Researchers & mentors"
        description="Find people by research field, skills or organization."
        actions={
          <Button asChild variant={mentorsOnly ? "default" : "outline"}>
            <Link href={mentorsOnly ? "/researchers" : "/researchers?mentors=1"}>
              {mentorsOnly ? "Showing mentors" : "Mentors only"}
            </Link>
          </Button>
        }
      />
      <SearchFilterBar
        action="/researchers"
        q={f.q}
        placeholder="Search by name, organization or bio"
        hidden={mentorsOnly ? { mentors: "1" } : {}}
        selects={[
          {
            name: "field",
            placeholder: "All fields",
            value: f.field,
            options: RESEARCH_FIELDS.map((x) => ({ value: x, label: x })),
          },
        ]}
      />

      {profiles.length === 0 ? (
        <EmptyState
          icon={UserSearch}
          title={hasFilters ? "No researchers match these filters" : "No researchers yet"}
          description="Try a different field or clear the filters."
          action={
            hasFilters ? (
              <Button asChild variant="outline">
                <Link href="/researchers">Clear filters</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {profiles.map((p) => (
            <ResearcherCard key={p.id} profile={p} />
          ))}
        </div>
      )}
    </>
  );
}
