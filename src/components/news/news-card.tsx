import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { NewsArticle } from "@/lib/news/types";

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{article.category}</Badge>
          <span>{formatDate(article.published_at)}</span>
        </div>
        <a href={article.url} target="_blank" rel="noreferrer" className="font-semibold leading-snug hover:underline">
          {article.title}
        </a>
        {article.summary && <p className="line-clamp-3 text-sm text-muted-foreground">{article.summary}</p>}
        <div className="mt-auto flex items-center justify-between pt-1 text-xs text-muted-foreground">
          <span className="truncate">{article.source}</span>
          <a href={article.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-medium text-primary hover:underline">
            Read <ExternalLink className="size-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
