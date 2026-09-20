"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { signIn } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { FormError } from "@/components/shared/form-error";
import { SubmitButton } from "@/components/shared/submit-button";

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const [state, action] = useActionState(signIn, null);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={action} className="grid gap-6">
      <div className="anim-rise">
        <p className="eyebrow eyebrow-accent mb-3">Welcome back</p>
        <h1 className="display text-5xl">
          Sign in to <em>Asterra.</em>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Continue to your projects, team and research notes.</p>
      </div>

      <div className="anim-rise grid gap-4" style={{ animationDelay: "120ms" }}>
        <FormError message={state && !state.ok ? state.error : initialError} />
        {next && <input type="hidden" name="next" value={next} />}
        <FormField label="Email" htmlFor="email" errors={errors?.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required className="h-11" />
        </FormField>
        <FormField label="Password" htmlFor="password" errors={errors?.password}>
          <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-11" />
        </FormField>
      </div>

      <div className="anim-rise grid gap-4" style={{ animationDelay: "220ms" }}>
        <SubmitButton size="lg" className="w-full" pendingText="Signing in…">
          Sign in
          <ArrowRight data-icon="inline-end" />
        </SubmitButton>
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </form>
  );
}
