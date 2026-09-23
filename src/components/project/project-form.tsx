"use client";

import { useActionState } from "react";
import { createProject, updateProject } from "@/actions/projects";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/shared/native-select";
import { FormField } from "@/components/shared/form-field";
import { FormError } from "@/components/shared/form-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { PROJECT_STATUS_LABELS, RESEARCH_FIELDS, type Project } from "@/types";
import { useT } from "@/lib/i18n/provider";

export function ProjectForm({ project }: { project?: Project }) {
  const t = useT();
  const boundAction = project ? updateProject.bind(null, project.id) : createProject;
  const [state, action] = useActionState(boundAction, null);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={action}>
      <Card>
        <CardContent className="grid gap-5">
          <FormError message={state && !state.ok ? state.error : undefined} />

          <FormField label={t("Project title")} htmlFor="title" errors={errors?.title}>
            <Input id="title" name="title" defaultValue={project?.title} required minLength={3} placeholder="AI-based detection of water pollution" />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-3">
            <FormField label={t("Research field")} htmlFor="research_field" errors={errors?.research_field} className="sm:col-span-1">
              <NativeSelect id="research_field" name="research_field" defaultValue={project?.research_field ?? ""} required>
                <option value="" disabled>
                  {t("Choose a field")}
                </option>
                {RESEARCH_FIELDS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField label={t("Status")} htmlFor="status" errors={errors?.status}>
              <NativeSelect id="status" name="status" defaultValue={project?.status ?? "idea"}>
                {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {t(label)}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField label={t("Visibility")} htmlFor="visibility" errors={errors?.visibility}>
              <NativeSelect id="visibility" name="visibility" defaultValue={project?.visibility ?? "public"}>
                <option value="public">{t("Public — discoverable by everyone")}</option>
                <option value="private">{t("Private — members only")}</option>
              </NativeSelect>
            </FormField>
          </div>

          <FormField
            label={t("Description")}
            htmlFor="description"
            hint={t("What is the project about? This text is used by AI Roadmap and AI Match.")}
            errors={errors?.description}
          >
            <Textarea id="description" name="description" rows={5} defaultValue={project?.description} />
          </FormField>

          <FormField label={t("Research question")} htmlFor="research_question" errors={errors?.research_question}>
            <Textarea id="research_question" name="research_question" rows={2} defaultValue={project?.research_question} />
          </FormField>

          <FormField label={t("Hypothesis")} htmlFor="hypothesis" errors={errors?.hypothesis}>
            <Textarea id="hypothesis" name="hypothesis" rows={2} defaultValue={project?.hypothesis} />
          </FormField>

          <FormField label={t("Methodology")} htmlFor="methodology" errors={errors?.methodology}>
            <Textarea id="methodology" name="methodology" rows={4} defaultValue={project?.methodology} />
          </FormField>

          <FormField
            label={t("Required skills")}
            htmlFor="required_skills"
            hint={t("Comma-separated, e.g. Python, remote sensing, statistics")}
            errors={errors?.required_skills}
          >
            <Input id="required_skills" name="required_skills" defaultValue={project?.required_skills.join(", ")} />
          </FormField>
        </CardContent>
        <CardFooter className="mt-6 justify-end">
          <SubmitButton pendingText={t("Saving…")}>{project ? t("Save changes") : t("Create project")}</SubmitButton>
        </CardFooter>
      </Card>
    </form>
  );
}
