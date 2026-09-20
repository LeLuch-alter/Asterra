export type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  image_url?: string | null;
  published_at: string;
};

export const NEWS_CATEGORIES = [
  "All",
  "Computer Science",
  "Biology",
  "Physics",
  "Chemistry",
  "Astronomy",
  "Environmental Science",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];
