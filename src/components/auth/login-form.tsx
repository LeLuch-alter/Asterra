"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { signIn } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { FormError } from "@/components/shared/form-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { useT } from "@/lib/i18n/provider";

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const t = useT();
  const [state, action] = useActionState(signIn, null);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={action} className="grid gap-6">
      <div className="anim-rise">
        <p className="eyebrow eyebrow-accent mb-3">{t("Welcome back")}</p>
        <h1 className="display text-5xl">
          {t("Sign in to")} <em>Asterra.</em>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("Continue to your projects, team and research notes.")}</p>
      </div>

      <div className="anim-rise grid gap-4" style={{ animationDelay: "120ms" }}>
        <FormError message={state && !state.ok ? state.error : initialError} />
        {next && <input type="hidden" name="next" value={next} />}
        <FormField label={t("Email")} htmlFor="email" errors={errors?.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required className="h-11" />
        </FormField>
        <FormField label={t("Password")} htmlFor="password" errors={errors?.password}>
          <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-11" />
        </FormField>
      </div>

      <div className="anim-rise grid gap-4" style={{ animationDelay: "220ms" }}>
        <SubmitButton size="lg" className="w-full" pendingText={t("Signing in…")}>
          {t("Sign in")}
          <ArrowRight data-icon="inline-end" />
        </SubmitButton>
        <p className="text-center text-sm text-muted-foreground">
          {t("New here?")}{" "}
          <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            {t("Create an account")}
          </Link>
        </p>
      </div>
    </form>
  );
}
