"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "@/actions/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { FormError } from "@/components/shared/form-error";
import { SubmitButton } from "@/components/shared/submit-button";

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const [state, action] = useActionState(signIn, null);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to continue to your projects.</CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="grid gap-4">
          <FormError message={state && !state.ok ? state.error : initialError} />
          {next && <input type="hidden" name="next" value={next} />}
          <FormField label="Email" htmlFor="email" errors={errors?.email}>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </FormField>
          <FormField label="Password" htmlFor="password" errors={errors?.password}>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </FormField>
        </CardContent>
        <CardFooter className="mt-6 flex-col gap-3">
          <SubmitButton className="w-full" pendingText="Signing in…">
            Sign in
          </SubmitButton>
          <p className="text-center text-sm text-muted-foreground">
            No account yet?{" "}
            <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
