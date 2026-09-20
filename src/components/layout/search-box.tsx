import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** Global search: a plain GET form to /search — works without JavaScript. */
export function SearchBox({ className, defaultValue, autoFocus }: { className?: string; defaultValue?: string; autoFocus?: boolean }) {
  return (
    <form action="/search" role="search" className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        name="q"
        type="search"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="Search people, projects…"
        aria-label="Search"
        className="h-9 w-full rounded-full border border-input bg-transparent pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
      />
    </form>
  );
}
