import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Props = { name: string; src?: string | null; className?: string };

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function UserAvatar({ name, src, className }: Props) {
  return (
    <Avatar className={cn("size-9", className)}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
        {initials(name || "?")}
      </AvatarFallback>
    </Avatar>
  );
}
