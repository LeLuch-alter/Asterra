import "server-only";
import { unstable_cache } from "next/cache";
import Parser from "rss-parser";
import { serverEnv } from "@/lib/env";
import { FALLBACK_NEWS } from "./fallback-news";
import { FIELD_FEEDS, NEWS_FIELDS, type NewsArticle, type NewsCategory, type NewsField } from "./types";

const parser = new Parser({ timeout: 6000, headers: { "User-Agent": "Mozilla/5.0 (compatible; Asterra/1.0)" } });

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function sourceName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Feed";
  }
}

/** Reads one feed and stamps every article with the field that feed belongs to. */
async function fetchFeed(url: string, field: NewsField): Promise<NewsArticle[]> {
  const feed = await parser.parseURL(url);
  const source = (feed.title ?? sourceName(url)).replace(/ News.*/i, "").trim() || sourceName(url);
  return (feed.items ?? [])
    .filter((item) => item.link && item.title)
    .map((item, i) => ({
      id: item.guid ?? item.link ?? `${url}-${i}`,
      title: item.title!.trim(),
      summary: stripHtml(item.contentSnippet ?? item.content ?? item.summary ?? "").slice(0, 300),
      url: item.link!,
      source,
      category: field as NewsCategory,
      image_url: item.enclosure?.url ?? null,
      published_at: item.isoDate ?? new Date().toISOString(),
    }));
}

function dedupeAndSort(articles: NewsArticle[], limit: number): NewsArticle[] {
  const seen = new Set<string>();
  return articles
    .filter((a) => (seen.has(a.url) ? false : (seen.add(a.url), true)))
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))
    .slice(0, limit);
}

/** All feeds of one science field. */
async function fetchField(field: NewsField, limit: number): Promise<NewsArticle[]> {
  const results = await Promise.allSettled(FIELD_FEEDS[field].map((url) => fetchFeed(url, field)));
  return dedupeAndSort(
    results.flatMap((r) => (r.status === "fulfilled" ? r.value : [])),
    limit,
  );
}

/** NewsAPI headlines are only used for the "All" tab; they have no reliable field. */
type NewsApiArticle = {
  title?: string | null;
  description?: string | null;
  url?: string | null;
  urlToImage?: string | null;
  publishedAt?: string | null;
  source?: { name?: string | null } | null;
};

async function fetchNewsApi(apiKey: string): Promise<NewsArticle[]> {
  const url = new URL("https://newsapi.org/v2/top-headlines");
  url.searchParams.set("category", "science");
  url.searchParams.set("language", "en");
  url.searchParams.set("pageSize", "30");

  const res = await fetch(url, { headers: { "X-Api-Key": apiKey }, next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`NewsAPI request failed (${res.status})`);
  const data = (await res.json()) as { articles?: NewsApiArticle[] };

  return (data.articles ?? [])
    .filter((a) => a.url && a.title && a.title !== "[Removed]")
    .map((a) => ({
      id: a.url!,
      title: a.title!.trim(),
      summary: (a.description ?? "").slice(0, 300),
      url: a.url!,
      source: a.source?.name ?? sourceName(a.url!),
      category: "All" as NewsCategory,
      image_url: a.urlToImage ?? null,
      published_at: a.publishedAt ?? new Date().toISOString(),
    }));
}

async function fetchCategory(category: NewsCategory): Promise<{ articles: NewsArticle[]; live: boolean }> {
  // One field: only that field's feeds — fast and unambiguous.
  if (category !== "All") {
    const articles = await fetchField(category as NewsField, 40);
    if (articles.length > 0) return { articles, live: true };
    return { articles: FALLBACK_NEWS.filter((a) => a.category === category), live: false };
  }

  // "All": a balanced mix from every field, newest first.
  const perField = await Promise.all(NEWS_FIELDS.map((f) => fetchField(f, 10)));
  const extras = serverEnv.newsApiKey ? await fetchNewsApi(serverEnv.newsApiKey).catch(() => []) : [];
  const articles = dedupeAndSort([...perField.flat(), ...extras], 60);
  if (articles.length === 0) return { articles: FALLBACK_NEWS, live: false };
  return { articles, live: true };
}

/**
 * Science news for one category. Each category is fetched and cached separately
 * for 30 minutes, so switching fields is instant and a broken feed only affects its own tab.
 * Never throws: falls back to seeded articles.
 */
export const getNews = unstable_cache(
  async (category: NewsCategory = "All") => {
    try {
      return await fetchCategory(category);
    } catch {
      const fallback = category === "All" ? FALLBACK_NEWS : FALLBACK_NEWS.filter((a) => a.category === category);
      return { articles: fallback, live: false };
    }
  },
  ["science-news"],
  { revalidate: 1800 },
);
