"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createSource } from "@/actions/graph";
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
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { FormError } from "@/components/shared/form-error";
import { NativeSelect } from "@/components/shared/native-select";
import { SubmitButton } from "@/components/shared/submit-button";
import type { ActionResult } from "@/types";
import { useT } from "@/lib/i18n/provider";

export type SourceTargetOption = { value: string; label: string; targetId?: string };

type Props = { projectId: string; targets: SourceTargetOption[] };

/**
 * Adds a scientific source and attaches it to a specific part of the research,
 * so the graph can show "this paper supports this part".
 */
export function SourceDialog({ projectId, targets }: Props) {
  const translate = useT();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState("project");
  const [state, action] = useActionState(async (prev: ActionResult | null, formData: FormData) => {
    const res = await createSource(projectId, prev, formData);
    if (res.ok) {
      toast.success(translate("Source added"));
      setOpen(false);
    }
    return res;
  }, null);
  const errors = state && !state.ok ? state.fieldErrors : undefined;
  const selected = targets.find((t) => t.value === target);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {translate("Add source")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <form action={action} key={open ? "open" : "closed"}>
          <DialogHeader>
            <DialogTitle>{translate("Add a scientific source")}</DialogTitle>
            <DialogDescription>
              {translate("Attach the paper or dataset to the part of the research it supports — not just to a reference list.")}
            </DialogDescription>
          </DialogHeader>
          <div className="my-5 grid gap-4">
            <FormError message={state && !state.ok ? state.error : undefined} />
            <FormField label={translate("Title")} htmlFor="src_title" errors={errors?.title}>
              <Input id="src_title" name="title" required placeholder="Spectral indices for water quality monitoring" />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <FormField label={translate("Authors")} htmlFor="src_authors" errors={errors?.authors}>
                <Input id="src_authors" name="authors" placeholder="Petrova, Kim et al." />
              </FormField>
              <FormField label={translate("Year")} htmlFor="src_year" errors={errors?.year}>
                <Input id="src_year" name="year" inputMode="numeric" placeholder="2024" />
              </FormField>
            </div>
            <FormField label={translate("Link")} htmlFor="src_url" hint={translate("DOI or URL")} errors={errors?.url}>
              <Input id="src_url" name="url" type="url" placeholder="https://doi.org/..." />
            </FormField>
            <FormField
              label={translate("Supports which part of the research?")}
              htmlFor="src_target"
              hint={translate("This is what connects the source to the graph.")}
              errors={errors?.target_type}
            >
              <NativeSelect
                id="src_target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                name="_target_choice"
              >
                {targets.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
            {/* The select above carries both the target kind and the row id. */}
            <input type="hidden" name="target_type" value={selected?.value.split(":")[0] ?? "project"} />
            <input type="hidden" name="target_id" value={selected?.targetId ?? ""} />
            <FormField label={translate("Why it matters")} htmlFor="src_note" errors={errors?.note}>
              <Textarea id="src_note" name="note" rows={2} placeholder="Gives the NDTI formula we use for turbidity." />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {translate("Cancel")}
            </Button>
            <SubmitButton pendingText={translate("Saving…")}>{translate("Add source")}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
