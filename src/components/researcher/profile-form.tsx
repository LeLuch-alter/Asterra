"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/profile";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/shared/native-select";
import { FormField } from "@/components/shared/form-field";
import { FormError } from "@/components/shared/form-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { USER_ROLE_LABELS, type Profile } from "@/types";
import { useT } from "@/lib/i18n/provider";

export function ProfileForm({ profile }: { profile: Profile }) {
  const t = useT();
  const [state, action] = useActionState(updateProfile, null);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state?.ok) toast.success(t("Profile saved"));
  }, [state, t]);

  return (
    <form action={action}>
      <Card>
        <CardContent className="grid gap-5">
          <FormError message={state && !state.ok ? state.error : undefined} />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label={t("Full name")} htmlFor="full_name" errors={errors?.full_name}>
              <Input id="full_name" name="full_name" defaultValue={profile.full_name} required />
            </FormField>
            <FormField label={t("Role")} htmlFor="role" errors={errors?.role}>
              <NativeSelect id="role" name="role" defaultValue={profile.role}>
                {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {t(label)}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label={t("University / organization")} htmlFor="organization" errors={errors?.organization}>
              <Input id="organization" name="organization" defaultValue={profile.organization} />
            </FormField>
            <FormField label={t("Years of research experience")} htmlFor="experience_years" errors={errors?.experience_years}>
              <Input
                id="experience_years"
                name="experience_years"
                type="number"
                min={0}
                max={60}
                defaultValue={profile.experience_years}
              />
            </FormField>
          </div>

          <FormField label={t("Bio")} htmlFor="bio" hint={t("A few sentences about your background and what you work on.")} errors={errors?.bio}>
            <Textarea id="bio" name="bio" rows={4} defaultValue={profile.bio} />
          </FormField>

          <FormField
            label={t("Research fields")}
            htmlFor="research_fields"
            hint={t("Comma-separated, e.g. Computer Science, Environmental Science")}
            errors={errors?.research_fields}
          >
            <Input id="research_fields" name="research_fields" defaultValue={profile.research_fields.join(", ")} />
          </FormField>

          <FormField label={t("Skills")} htmlFor="skills" hint={t("Comma-separated, e.g. Python, statistics, lab work")} errors={errors?.skills}>
            <Input id="skills" name="skills" defaultValue={profile.skills.join(", ")} />
          </FormField>

          <FormField label={t("Research interests")} htmlFor="interests" hint={t("Comma-separated")} errors={errors?.interests}>
            <Input id="interests" name="interests" defaultValue={profile.interests.join(", ")} />
          </FormField>

          <div className="flex items-center gap-2">
            <Checkbox id="is_mentor" name="is_mentor" defaultChecked={profile.is_mentor} />
            <Label htmlFor="is_mentor">{t("I am available as a mentor for student projects")}</Label>
          </div>
        </CardContent>
        <CardFooter className="mt-6 justify-end">
          <SubmitButton pendingText={t("Saving…")}>{t("Save profile")}</SubmitButton>
        </CardFooter>
      </Card>
    </form>
  );
}
