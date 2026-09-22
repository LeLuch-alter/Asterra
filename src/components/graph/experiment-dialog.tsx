"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createExperiment, updateExperiment } from "@/actions/graph";
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
import { EXPERIMENT_STATUS_LABELS, type ActionResult, type Experiment } from "@/types";

type Props = { projectId: string; experiment?: Experiment; trigger?: React.ReactNode };

/** Create or edit an experiment: purpose, methodology, data and outcome. */
export function ExperimentDialog({ projectId, experiment, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const bound = experiment
    ? updateExperiment.bind(null, experiment.id, projectId)
    : createExperiment.bind(null, projectId);
  const [state, action] = useActionState(async (prev: ActionResult | null, formData: FormData) => {
    const res = await bound(prev, formData);
    if (res.ok) {
      toast.success(experiment ? "Experiment updated" : "Experiment added");
      setOpen(false);
    }
    return res;
  }, null);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus />
            Add experiment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form action={action} key={open ? "open" : "closed"}>
          <DialogHeader>
            <DialogTitle>{experiment ? "Edit experiment" : "New experiment"}</DialogTitle>
            <DialogDescription>
              An experiment connects the methodology to a result. Describe what it tests and what came out of it.
            </DialogDescription>
          </DialogHeader>
          <div className="my-5 grid max-h-[60vh] gap-4 overflow-y-auto pr-1">
            <FormError message={state && !state.ok ? state.error : undefined} />
            <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
              <FormField label="Title" htmlFor="exp_title" errors={errors?.title}>
                <Input id="exp_title" name="title" defaultValue={experiment?.title} required placeholder="Experiment #1 — spectral indices" />
              </FormField>
              <FormField label="Status" htmlFor="exp_status" errors={errors?.status}>
                <NativeSelect id="exp_status" name="status" defaultValue={experiment?.status ?? "planned"}>
                  {Object.entries(EXPERIMENT_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>
            </div>
            <FormField label="Purpose" htmlFor="exp_purpose" hint="What question does this experiment answer?" errors={errors?.purpose}>
              <Textarea id="exp_purpose" name="purpose" rows={2} defaultValue={experiment?.purpose} />
            </FormField>
            <FormField label="Methodology" htmlFor="exp_method" errors={errors?.methodology}>
              <Textarea id="exp_method" name="methodology" rows={3} defaultValue={experiment?.methodology} />
            </FormField>
            <FormField label="Input / data" htmlFor="exp_data" errors={errors?.data_description}>
              <Textarea id="exp_data" name="data_description" rows={2} defaultValue={experiment?.data_description} />
            </FormField>
            <FormField label="Outcome" htmlFor="exp_outcome" hint="What happened? Leave empty while it is still running." errors={errors?.outcome}>
              <Textarea id="exp_outcome" name="outcome" rows={3} defaultValue={experiment?.outcome} />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton pendingText="Saving…">{experiment ? "Save" : "Add experiment"}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
