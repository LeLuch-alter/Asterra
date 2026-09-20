import Link from "next/link";
import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NewsCard } from "@/components/news/news-card";
import { getNews } from "@/lib/news/fetch-news";
import { NEWS_CATEGORIES } from "@/lib/news/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Science news" };
export const revalidate = 1800;

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category = "All" } = await searchParams;
  const { articles, live } = await getNews();
  const filtered = category === "All" ? articles : articles.filter((a) => a.category === category);

  return (
    <>
      <PageHeader
        title="Science news"
        description="Latest headlines from public science feeds."
        actions={!live ? <Badge variant="outline">Demo data</Badge> : undefined}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {NEWS_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={c === "All" ? "/news" : `/news?category=${encodeURIComponent(c)}`}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              c === category ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
            )}
          >
            {c}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Newspaper} title="No articles in this category" description="Try another category." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </>
  );
}
