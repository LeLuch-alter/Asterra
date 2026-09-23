import Link from "next/link";
import { ExternalLink, Newspaper } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { getNews } from "@/lib/news/fetch-news";
import { NEWS_CATEGORIES, type NewsCategory } from "@/lib/news/types";
import type { NewsArticle } from "@/lib/news/types";
import { formatDate } from "@/lib/format";
import { getLocale, getT } from "@/lib/i18n/server";
import type { Locale, Translator } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type Props = {
  category?: NewsCategory;
  /** Base path for category links: "/" on the home page, "/news" inside the app. */
  basePath: "/" | "/news";
};

function categoryHref(basePath: string, c: string) {
  if (c === "All") return basePath;
  return `${basePath}?category=${encodeURIComponent(c)}`;
}

function Meta({ a, t, locale }: { a: NewsArticle; t: Translator; locale: Locale }) {
  return (
    <p className="eyebrow flex flex-wrap items-center gap-x-2">
      <span className="eyebrow-accent">{t(a.category)}</span>
      <span className="text-border">/</span>
      <span>{a.source}</span>
      <span className="text-border">/</span>
      <time dateTime={a.published_at}>{formatDate(a.published_at, undefined, locale)}</time>
    </p>
  );
}

/** Lead story: big serif headline + full summary. */
function Featured({ a, t, locale }: { a: NewsArticle; t: Translator; locale: Locale }) {
  return (
    <article className="grid gap-4 border-b py-8 md:grid-cols-[1fr_minmax(0,2fr)] md:gap-10">
      <Meta a={a} t={t} locale={locale} />
      <div>
        <h2 className="display text-3xl leading-tight sm:text-4xl">
          <a href={a.url} target="_blank" rel="noreferrer" className="hover:text-primary">
            {a.title}
          </a>
        </h2>
        {a.summary && <p className="reading mt-4 max-w-2xl text-muted-foreground">{a.summary}</p>}
        <a href={a.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium hover:text-primary">
          {t("Read the story")} <ExternalLink className="size-3.5" />
        </a>
      </div>
    </article>
  );
}

/** List row: readable, one article per line with a clear hierarchy. */
function Row({ a, t, locale }: { a: NewsArticle; t: Translator; locale: Locale }) {
  return (
    <article className="grid gap-2 border-b py-6 md:grid-cols-[1fr_minmax(0,2fr)] md:gap-10">
      <Meta a={a} t={t} locale={locale} />
      <div>
        <h3 className="text-xl font-semibold leading-snug tracking-tight">
          <a href={a.url} target="_blank" rel="noreferrer" className="hover:text-primary">
            {a.title}
          </a>
        </h3>
        {a.summary && <p className="reading mt-2 line-clamp-3 text-[0.95rem] text-muted-foreground">{a.summary}</p>}
      </div>
    </article>
  );
}

export async function NewsFeed({ category = "All", basePath }: Props) {
  const { articles, live } = await getNews(category);
  const [lead, ...rest] = articles;
  const [t, locale] = await Promise.all([getT(), getLocale()]);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <nav className="-mx-1 flex flex-wrap gap-1" aria-label={t("News categories")}>
          {NEWS_CATEGORIES.map((c) => (
            <Link
              key={c}
              href={categoryHref(basePath, c)}
              className={cn(
                "rounded-full px-3 py-1 text-sm transition-colors",
                c === category ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {t(c)}
            </Link>
          ))}
        </nav>
        <p className="eyebrow">{live ? t("{count} stories · live feeds", { count: articles.length }) : t("Demo data")}</p>
      </div>

      {!lead ? (
        <EmptyState icon={Newspaper} title={t("No articles in this category")} description={t("Try another category.")} className="mt-6" />
      ) : (
        <>
          <Featured a={lead} t={t} locale={locale} />
          {rest.map((a) => (
            <Row key={a.id} a={a} t={t} locale={locale} />
          ))}
        </>
      )}
    </section>
  );
}
