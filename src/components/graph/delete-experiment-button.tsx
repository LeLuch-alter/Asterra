"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteExperiment } from "@/actions/graph";
import { Button } from "@/components/ui/button";

export function DeleteExperimentButton({ experimentId, projectId }: { experimentId: string; projectId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Delete experiment"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this experiment? Linked results stay, but lose the link.")) return;
        start(async () => {
          const res = await deleteExperiment(experimentId, projectId);
          if (!res.ok) toast.error(res.error);
          else toast.success("Experiment deleted");
        });
      }}
    >
      <Trash2 />
    </Button>
  );
}
