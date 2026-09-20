"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { signUp } from "@/actions/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { FormError } from "@/components/shared/form-error";
import { SubmitButton } from "@/components/shared/submit-button";

export function RegisterForm() {
  const [state, action] = useActionState(signUp, null);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  if (state?.ok) {
    return (
      <Alert>
        <MailCheck />
        <AlertTitle>Check your email</AlertTitle>
        <AlertDescription>
          We sent a confirmation link. Open it to activate your account, then sign in.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Join as a student, researcher or mentor.</CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="grid gap-4">
          <FormError message={state && !state.ok ? state.error : undefined} />
          <FormField label="Full name" htmlFor="full_name" errors={errors?.full_name}>
            <Input id="full_name" name="full_name" autoComplete="name" required />
          </FormField>
          <FormField label="Email" htmlFor="email" errors={errors?.email}>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </FormField>
          <FormField label="Password" htmlFor="password" hint="At least 6 characters" errors={errors?.password}>
            <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={6} />
          </FormField>
        </CardContent>
        <CardFooter className="mt-6 flex-col gap-3">
          <SubmitButton className="w-full" pendingText="Creating…">
            Create account
          </SubmitButton>
          <p className="text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
