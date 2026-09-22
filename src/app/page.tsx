import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { NewsFeed } from "@/components/news/news-feed";
import { NEWS_CATEGORIES, type NewsCategory } from "@/lib/news/types";
import { OrbitScene } from "@/components/shared/orbit-scene";
import { NotConfigured } from "@/components/shared/not-configured";
import { publicEnv } from "@/lib/env";
import { getUser } from "@/lib/supabase/server";

export const revalidate = 1800;

const STATS = [
  ["Active researchers", "12,480"],
  ["Research projects", "3,210"],
  ["Universities & institutions", "864"],
  ["Collaboration requests", "5,680"],
] as const;

export default async function HomePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  if (!publicEnv.supabaseConfigured) return <NotConfigured />;
  const [{ category: raw = "All" }, user] = await Promise.all([searchParams, getUser()]);
  const category = (NEWS_CATEGORIES as readonly string[]).includes(raw) ? (raw as NewsCategory) : "All";

  return (
    <>
      <SiteHeader signedIn={Boolean(user)} />
      <main className="flex-1">
        {/* Compact hero: the news feed is the first thing on the page, the hero stays short. */}
        <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-6 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:pt-14">
          <div className="anim-rise">
            <p className="eyebrow eyebrow-accent mb-4">
              Science <span className="mx-1 text-border">/</span> Collaboration <span className="mx-1 text-border">/</span> Impact
            </p>
            <h1 className="display text-5xl sm:text-6xl lg:text-7xl">
              Where research becomes <em>momentum.</em>
            </h1>
            <p className="reading mt-5 max-w-lg text-muted-foreground">
              Asterra is a collaborative platform for researchers, students and mentors. Find your team, explore
              projects, and turn ideas into real research.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={user ? "/projects" : "/register"}>
                  {user ? "Explore projects" : "Join the community"}
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={user ? "/dashboard" : "/projects"}>{user ? "Open dashboard" : "Explore projects"}</Link>
              </Button>
            </div>
          </div>
          <OrbitScene className="mx-auto hidden max-w-[440px] lg:block" />
        </section>

        <section className="hairline mx-auto max-w-6xl px-4 sm:px-6">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-6 py-6 md:grid-cols-4">
            {STATS.map(([label, value]) => (
              <div key={label} className="border-l pl-4">
                <dd className="display text-3xl">{value}</dd>
                <dt className="mt-1 text-xs text-muted-foreground">{label}</dt>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-2">Today in science</p>
              <h2 className="display text-4xl">Latest news</h2>
            </div>
          </div>
          <NewsFeed category={category} basePath="/" />
        </section>
      </main>
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:px-6">
          <p>Asterra — student demonstration project.</p>
          <p className="eyebrow">AI output is assistance, not scientific validation</p>
        </div>
      </footer>
    </>
  );
}
