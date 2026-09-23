"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, MailCheck } from "lucide-react";
import { signUp } from "@/actions/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { FormError } from "@/components/shared/form-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { useT } from "@/lib/i18n/provider";

export function RegisterForm() {
  const t = useT();
  const [state, action] = useActionState(signUp, null);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  if (state?.ok) {
    return (
      <Alert className="anim-rise">
        <MailCheck />
        <AlertTitle>{t("Check your email")}</AlertTitle>
        <AlertDescription>{t("We sent a confirmation link. Open it to activate your account, then sign in.")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={action} className="grid gap-6">
      <div className="anim-rise">
        <p className="eyebrow eyebrow-accent mb-3">{t("Join the community")}</p>
        <h1 className="display text-5xl">
          {t("Turn ideas into")} <em>{t("real research.")}</em>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("Create research projects, find your team and plan with AI. Free for students, researchers and mentors.")}
        </p>
      </div>

      <div className="anim-rise grid gap-4" style={{ animationDelay: "120ms" }}>
        <FormError message={state && !state.ok ? state.error : undefined} />
        <FormField label={t("Full name")} htmlFor="full_name" errors={errors?.full_name}>
          <Input id="full_name" name="full_name" autoComplete="name" required className="h-11" placeholder="Aigerim Nurlan" />
        </FormField>
        <FormField label={t("Email")} htmlFor="email" errors={errors?.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required className="h-11" placeholder="you@university.edu" />
        </FormField>
        <FormField label={t("Password")} htmlFor="password" hint={t("At least 6 characters")} errors={errors?.password}>
          <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={6} className="h-11" />
        </FormField>
      </div>

      <div className="anim-rise grid gap-4" style={{ animationDelay: "220ms" }}>
        <SubmitButton size="lg" className="w-full" pendingText={t("Creating account…")}>
          {t("Create account")}
          <ArrowRight data-icon="inline-end" />
        </SubmitButton>
        <p className="text-center text-sm text-muted-foreground">
          {t("Already registered?")}{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            {t("Sign in")}
          </Link>
        </p>
      </div>
    </form>
  );
}
