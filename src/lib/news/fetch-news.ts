import "server-only";
import Parser from "rss-parser";
import { serverEnv } from "@/lib/env";
import { FALLBACK_NEWS } from "./fallback-news";
import type { NewsArticle } from "./types";

const parser = new Parser({ timeout: 8000 });

/** Very small keyword classifier so RSS items land in our demo categories. */
const CATEGORY_KEYWORDS: [string, RegExp][] = [
  ["Astronomy", /\b(space|planet|galaxy|telescope|nasa|star|asteroid|orbit|cosmic|mars|moon)\b/i],
  ["Physics", /\b(quantum|particle|physic|laser|magnet|superconduct|photon|gravity)\b/i],
  ["Chemistry", /\b(chemi|molecule|catalyst|polymer|enzyme|compound|battery)\b/i],
  ["Biology", /\b(cell|gene|dna|protein|bacteria|species|brain|neuro|evolution|animal|plant)\b/i],
  ["Environmental Science", /\b(climate|ocean|carbon|pollution|ecosystem|forest|coral|emission|weather|reef)\b/i],
  ["Computer Science", /\b(ai|artificial intelligence|machine learning|algorithm|robot|software|computer|data)\b/i],
];

function classify(text: string): string {
  for (const [category, regex] of CATEGORY_KEYWORDS) {
    if (regex.test(text)) return category;
  }
  return "General";
}

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

async function fetchFeed(url: string): Promise<NewsArticle[]> {
  const feed = await parser.parseURL(url);
  const source = feed.title ?? sourceName(url);
  return (feed.items ?? [])
    .filter((item) => item.link && item.title)
    .map((item, i) => {
      const summary = stripHtml(item.contentSnippet ?? item.content ?? item.summary ?? "").slice(0, 300);
      return {
        id: item.guid ?? item.link ?? `${url}-${i}`,
        title: item.title!.trim(),
        summary,
        url: item.link!,
        source,
        category: classify(`${item.title} ${summary}`),
        image_url: item.enclosure?.url ?? null,
        published_at: item.isoDate ?? new Date().toISOString(),
      };
    });
}

type NewsApiArticle = {
  title?: string | null;
  description?: string | null;
  url?: string | null;
  urlToImage?: string | null;
  publishedAt?: string | null;
  source?: { name?: string | null } | null;
};

/** NewsAPI.org science headlines (free tier: ~100 requests/day, cached by the page revalidate). */
async function fetchNewsApi(apiKey: string): Promise<NewsArticle[]> {
  const url = new URL("https://newsapi.org/v2/top-headlines");
  url.searchParams.set("category", "science");
  url.searchParams.set("language", "en");
  url.searchParams.set("pageSize", "50");

  const res = await fetch(url, { headers: { "X-Api-Key": apiKey }, next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`NewsAPI request failed (${res.status})`);
  const data = (await res.json()) as { articles?: NewsApiArticle[] };

  return (data.articles ?? [])
    .filter((a) => a.url && a.title && a.title !== "[Removed]")
    .map((a) => {
      const summary = (a.description ?? "").slice(0, 300);
      return {
        id: a.url!,
        title: a.title!.trim(),
        summary,
        url: a.url!,
        source: a.source?.name ?? sourceName(a.url!),
        category: classify(`${a.title} ${summary}`),
        image_url: a.urlToImage ?? null,
        published_at: a.publishedAt ?? new Date().toISOString(),
      };
    });
}

/**
 * Fetches NewsAPI (if a key is set) and all configured RSS feeds. Never throws:
 * if nothing is configured or every source fails, returns seeded fallback articles.
 */
export async function getNews(): Promise<{ articles: NewsArticle[]; live: boolean }> {
  const urls = serverEnv.newsFeedUrls;
  const apiKey = serverEnv.newsApiKey;
  if (urls.length === 0 && !apiKey) return { articles: FALLBACK_NEWS, live: false };

  const sources: Promise<NewsArticle[]>[] = [...urls.map(fetchFeed)];
  if (apiKey) sources.unshift(fetchNewsApi(apiKey));

  const results = await Promise.allSettled(sources);
  const seen = new Set<string>();
  const articles = results
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .filter((a) => (seen.has(a.url) ? false : (seen.add(a.url), true)))
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))
    .slice(0, 60);

  if (articles.length === 0) return { articles: FALLBACK_NEWS, live: false };
  return { articles, live: true };
}
