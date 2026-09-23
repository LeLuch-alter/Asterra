"use client";

import { useState, useTransition } from "react";
import { GitFork, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { forkProject } from "@/actions/graph";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n/provider";

/** Start a new research direction from an existing project. The original stays untouched. */
export function ForkDialog({ projectId, projectTitle }: { projectId: string; projectTitle: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(`${projectTitle} — ${t("new direction")}`);
  const [pending, start] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <GitFork />
          {t("Fork")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Fork this research")}</DialogTitle>
          <DialogDescription>
            {t("You get your own project with the same question, hypothesis, methodology and roadmap as a starting point. The original project stays unchanged, and both stay linked.")}
          </DialogDescription>
        </DialogHeader>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} aria-label={t("New project title")} maxLength={200} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("Cancel")}
          </Button>
          <Button
            disabled={pending || title.trim().length < 3}
            onClick={() =>
              start(async () => {
                const res = await forkProject(projectId, title);
                if (res && !res.ok) toast.error(res.error);
              })
            }
          >
            {pending && <Loader2 className="animate-spin" />}
            {t("Create fork")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
