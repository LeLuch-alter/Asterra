import { NextResponse } from "next/server";
import { getNews } from "@/lib/news/fetch-news";
import { NEWS_CATEGORIES, type NewsCategory } from "@/lib/news/types";

// Cache the feed for 30 minutes on the server.
export const revalidate = 1800;

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("category") ?? "All";
  const category: NewsCategory = (NEWS_CATEGORIES as readonly string[]).includes(raw) ? (raw as NewsCategory) : "All";
  const { articles, live } = await getNews(category);
  return NextResponse.json({ articles, live, category });
}
