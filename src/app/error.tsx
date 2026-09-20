"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

/** Root error boundary (landing + auth pages). The (app) group has its own. */
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const configIssue = error.message.includes("environment variable");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Logo />
      <AlertTriangle className="size-8 text-destructive" />
      <h1 className="text-xl font-semibold">{configIssue ? "The app is not configured yet" : "Something went wrong"}</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {configIssue
          ? `${error.message} On Vercel, add the variables under Settings → Environment Variables and redeploy.`
          : "Please try again. If the problem persists, reload the page."}
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
