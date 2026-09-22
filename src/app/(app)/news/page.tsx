import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { NewsFeed } from "@/components/news/news-feed";
import { NEWS_CATEGORIES, type NewsCategory } from "@/lib/news/types";

export const metadata: Metadata = { title: "Science news" };
export const revalidate = 1800;

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category: raw = "All" } = await searchParams;
  const category = (NEWS_CATEGORIES as readonly string[]).includes(raw) ? (raw as NewsCategory) : "All";
  return (
    <>
      <PageHeader eyebrow="Today in science" title="Science news" description="Latest headlines from public science feeds." />
      <NewsFeed category={category} basePath="/news" />
    </>
  );
}
