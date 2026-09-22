"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteSource } from "@/actions/graph";
import { Button } from "@/components/ui/button";

export function DeleteSourceButton({ sourceId, projectId }: { sourceId: string; projectId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Remove source"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await deleteSource(sourceId, projectId);
          if (!res.ok) toast.error(res.error);
        })
      }
    >
      <Trash2 />
    </Button>
  );
}
