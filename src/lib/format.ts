import { LOCALE_TAGS, type Locale } from "@/lib/i18n/config";

export function formatDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
  locale: Locale = "en",
) {
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], opts).format(new Date(iso));
}

export function timeAgo(iso: string, locale: Locale = "en") {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat(LOCALE_TAGS[locale], { numeric: "auto" });
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(-Math.round(diff / secs), unit);
  }
  return new Intl.RelativeTimeFormat(LOCALE_TAGS[locale], { numeric: "auto" }).format(0, "second");
}
