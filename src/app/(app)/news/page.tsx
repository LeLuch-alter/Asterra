import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { NewsFeed } from "@/components/news/news-feed";

export const metadata: Metadata = { title: "Science news" };
export const revalidate = 1800;

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category = "All" } = await searchParams;
  return (
    <>
      <PageHeader eyebrow="Today in science" title="Science news" description="Latest headlines from public science feeds." />
      <NewsFeed category={category} basePath="/news" />
    </>
  );
}
