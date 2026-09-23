import Link from "next/link";
import type { Metadata } from "next";
import { UserSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { ResearcherCard } from "@/components/researcher/researcher-card";
import { ConnectButton } from "@/components/researcher/connect-button";
import { requireUser } from "@/lib/supabase/server";
import { searchProfiles } from "@/lib/supabase/queries/profiles";
import { getConnectionStates } from "@/lib/supabase/queries/social";
import { RESEARCH_FIELDS } from "@/types";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Researchers" };

type Search = { q?: string; field?: string; skill?: string; mentors?: string };

export default async function ResearchersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const [f, user] = await Promise.all([searchParams, requireUser()]);
  const mentorsOnly = f.mentors === "1";
  const profiles = await searchProfiles({ q: f.q, field: f.field, skill: f.skill, mentorsOnly });
  const states = await getConnectionStates(
    user.id,
    profiles.map((p) => p.id),
  );
  const hasFilters = Boolean(f.q || f.field || f.skill || mentorsOnly);
  const t = await getT();

  return (
    <>
      <PageHeader
        eyebrow={t("People")}
        title={t("Researchers & mentors")}
        description={t("Find people by research field, skills or organization, and connect with them.")}
        actions={
          <Button asChild variant={mentorsOnly ? "default" : "outline"}>
            <Link href={mentorsOnly ? "/researchers" : "/researchers?mentors=1"}>{mentorsOnly ? t("Showing mentors") : t("Mentors only")}</Link>
          </Button>
        }
      />
      <SearchFilterBar
        action="/researchers"
        q={f.q}
        placeholder={t("Search by name, organization or bio")}
        hidden={mentorsOnly ? { mentors: "1" } : {}}
        selects={[{ name: "field", placeholder: t("All fields"), value: f.field, options: RESEARCH_FIELDS.map((x) => ({ value: x, label: x })) }]}
      />

      {profiles.length === 0 ? (
        <EmptyState
          icon={UserSearch}
          title={hasFilters ? t("No researchers match these filters") : t("No researchers yet")}
          description={t("Try a different field or clear the filters.")}
          action={
            hasFilters ? (
              <Button asChild variant="outline">
                <Link href="/researchers">{t("Clear filters")}</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {profiles.map((p) => (
            <ResearcherCard key={p.id} profile={p} action={<ConnectButton otherId={p.id} state={states[p.id] ?? { kind: "none" }} />} />
          ))}
        </div>
      )}
    </>
  );
}
