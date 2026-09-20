"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const configIssue = error.message.includes("environment variable");
  return (
    <EmptyState
      icon={AlertTriangle}
      title={configIssue ? "The app is not configured yet" : "Something went wrong"}
      description={configIssue ? error.message : "Please try again. If the problem persists, reload the page."}
      action={
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
      }
    />
  );
}
