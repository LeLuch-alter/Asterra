"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createResult, updateResult } from "@/actions/results";
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
import { NativeSelect } from "@/components/shared/native-select";
import { FormField } from "@/components/shared/form-field";
import { FormError } from "@/components/shared/form-error";
import { SubmitButton } from "@/components/shared/submit-button";
import type { ActionResult, ResearchResult } from "@/types";

type Props = {
  projectId: string;
  result?: ResearchResult;
  /** Experiments this result can be attached to. */
  experiments?: { id: string; title: string }[];
  trigger?: React.ReactNode;
};

/** Create or edit a research result/note in a dialog. */
export function ResultFormDialog({ projectId, result, experiments = [], trigger }: Props) {
  const [open, setOpen] = useState(false);
  const boundAction = result ? updateResult.bind(null, result.id, projectId) : createResult.bind(null, projectId);
  const [state, action] = useActionState(async (prev: ActionResult | null, formData: FormData) => {
    const res = await boundAction(prev, formData);
    if (res.ok) {
      toast.success(result ? "Result updated" : "Result added");
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
            Add result
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form action={action} key={open ? "open" : "closed"}>
          <DialogHeader>
            <DialogTitle>{result ? "Edit research result" : "New research result"}</DialogTitle>
            <DialogDescription>
              Notes, findings, experiment logs or a draft section. The AI Assistant can summarize and review it.
            </DialogDescription>
          </DialogHeader>
          <div className="my-5 grid gap-4">
            <FormError message={state && !state.ok ? state.error : undefined} />
            <FormField label="Title" htmlFor="result_title" errors={errors?.title}>
              <Input id="result_title" name="title" defaultValue={result?.title} required />
            </FormField>
            <FormField label="Content" htmlFor="result_content" errors={errors?.content}>
              <Textarea id="result_content" name="content" rows={12} defaultValue={result?.content} required />
            </FormField>
            {experiments.length > 0 && (
              <FormField
                label="Came from experiment"
                htmlFor="result_experiment"
                hint="Links this result to an experiment in the research graph."
              >
                <NativeSelect id="result_experiment" name="experiment_id" defaultValue={result?.experiment_id ?? ""}>
                  <option value="">Not linked to an experiment</option>
                  {experiments.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton pendingText="Saving…">{result ? "Save" : "Add result"}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
