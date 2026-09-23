"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useT } from "@/lib/i18n/provider";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  const configIssue = error.message.includes("environment variable");
  return (
    <EmptyState
      icon={AlertTriangle}
      title={configIssue ? t("The app is not configured yet") : t("Something went wrong")}
      description={configIssue ? error.message : t("Please try again. If the problem persists, reload the page.")}
      action={
        <Button onClick={reset} variant="outline">
          {t("Try again")}
        </Button>
      }
    />
  );
}
