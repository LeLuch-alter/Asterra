"use client";

import { useOptimistic, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { toggleBookmark } from "@/actions/bookmarks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BookmarkButton({ projectId, bookmarked, label = true }: { projectId: string; bookmarked: boolean; label?: boolean }) {
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(bookmarked);

  return (
    <Button
      variant="outline"
      size={label ? "sm" : "icon-sm"}
      disabled={pending}
      aria-pressed={optimistic}
      aria-label={optimistic ? "Remove from saved" : "Save project"}
      onClick={() =>
        start(async () => {
          setOptimistic(!optimistic);
          const res = await toggleBookmark(projectId);
          if (!res.ok) toast.error(res.error);
        })
      }
    >
      <Bookmark className={cn(optimistic && "fill-current")} />
      {label && (optimistic ? "Saved" : "Save")}
    </Button>
  );
}
