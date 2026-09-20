import { Badge } from "@/components/ui/badge";

type Props = {
  tags: string[];
  max?: number;
  variant?: "default" | "secondary" | "outline";
  highlight?: string[];
};

/** Renders skills / fields / interests as badges, truncating with a "+N" badge. */
export function TagList({ tags, max = 6, variant = "secondary", highlight = [] }: Props) {
  if (tags.length === 0) return null;
  const shown = tags.slice(0, max);
  const rest = tags.length - shown.length;
  const hl = new Set(highlight.map((h) => h.toLowerCase()));
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((tag) => (
        <Badge key={tag} variant={hl.has(tag.toLowerCase()) ? "default" : variant}>
          {tag}
        </Badge>
      ))}
      {rest > 0 && <Badge variant="outline">+{rest}</Badge>}
    </div>
  );
}
