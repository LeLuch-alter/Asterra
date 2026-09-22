export type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: NewsCategory;
  image_url?: string | null;
  published_at: string;
};

/** Science fields the news feed is divided into. */
export const NEWS_FIELDS = [
  "Computer Science",
  "Biology",
  "Physics",
  "Chemistry",
  "Astronomy",
  "Environmental Science",
  "Medicine",
] as const;

export const NEWS_CATEGORIES = ["All", ...NEWS_FIELDS] as const;

export type NewsField = (typeof NEWS_FIELDS)[number];
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export function isNewsField(value: string): value is NewsField {
  return (NEWS_FIELDS as readonly string[]).includes(value);
}

/**
 * One RSS feed per science field, so a category is the feed it came from
 * instead of a keyword guess. ScienceDaily publishes a topic feed per field.
 */
export const FIELD_FEEDS: Record<NewsField, string[]> = {
  "Computer Science": [
    "https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml",
    "https://www.sciencedaily.com/rss/computers_math/computer_science.xml",
  ],
  Biology: [
    "https://www.sciencedaily.com/rss/plants_animals/biology.xml",
    "https://www.sciencedaily.com/rss/plants_animals/molecular_biology.xml",
  ],
  Physics: ["https://www.sciencedaily.com/rss/matter_energy/physics.xml"],
  Chemistry: ["https://www.sciencedaily.com/rss/matter_energy/chemistry.xml"],
  Astronomy: [
    "https://www.sciencedaily.com/rss/space_time/astronomy.xml",
    "https://www.sciencedaily.com/rss/space_time/space_exploration.xml",
  ],
  "Environmental Science": [
    "https://www.sciencedaily.com/rss/earth_climate/environmental_science.xml",
    "https://www.sciencedaily.com/rss/earth_climate/climate.xml",
  ],
  Medicine: ["https://www.sciencedaily.com/rss/health_medicine/medical_topics.xml"],
};
