"use client";

import { useState, useTransition } from "react";
import { Archive } from "lucide-react";
import { toast } from "sonner";
import { archiveProject } from "@/actions/projects";
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
import { useT } from "@/lib/i18n/provider";

export function ArchiveProjectButton({ projectId }: { projectId: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="mt-2 justify-start text-destructive hover:text-destructive">
          <Archive />
          {t("Archive project")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Archive this project?")}</DialogTitle>
          <DialogDescription>
            {t("It will be hidden from discovery. Members can still open it, and you can change the status back later.")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("Cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await archiveProject(projectId);
                if (res && !res.ok) toast.error(res.error);
              })
            }
          >
            {t("Archive")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
