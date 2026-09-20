import { NextResponse } from "next/server";
import { getNews } from "@/lib/news/fetch-news";

// Cache the feed for 30 minutes on the server.
export const revalidate = 1800;

export async function GET(request: Request) {
  const category = new URL(request.url).searchParams.get("category");
  const { articles, live } = await getNews();
  const filtered = category && category !== "All" ? articles.filter((a) => a.category === category) : articles;
  return NextResponse.json({ articles: filtered, live });
}
