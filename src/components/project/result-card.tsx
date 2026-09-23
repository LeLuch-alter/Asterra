"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Pencil, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteResult } from "@/actions/results";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatDate } from "@/lib/format";
import type { ResearchResultWithAuthor } from "@/types";
import { useLocale, useT } from "@/lib/i18n/provider";
import { ResultFormDialog } from "./result-form-dialog";

type Props = {
  result: ResearchResultWithAuthor;
  canEdit: boolean;
  isMember: boolean;
  experiments?: { id: string; title: string }[];
};

export function ResultCard({ result, canEdit, isMember, experiments = [] }: Props) {
  const t = useT();
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [pending, start] = useTransition();
  const long = result.content.length > 600;

  function remove() {
    if (!confirm(t("Delete this research result?"))) return;
    start(async () => {
      const res = await deleteResult(result.id, result.project_id);
      if (!res.ok) toast.error(res.error);
      else toast.success(t("Result deleted"));
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold leading-snug">{result.title}</h3>
            <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <UserAvatar name={result.author.full_name} src={result.author.avatar_url} className="size-5" />
              {result.author.full_name} · {formatDate(result.created_at, undefined, locale)}
              {result.updated_at !== result.created_at && ` · ${t("edited")}`}
              {result.experiment_id && (
                <>
                  {` · ${t("from")} `}
                  <Link href={`/projects/${result.project_id}/experiments`} className="hover:underline">
                    {experiments.find((e) => e.id === result.experiment_id)?.title ?? t("an experiment")}
                  </Link>
                </>
              )}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            {isMember && (
              <Button asChild variant="ghost" size="sm" title={t("Open in AI Assistant")}>
                <Link href={`/projects/${result.project_id}/assistant?result=${result.id}`}>
                  <Sparkles />
                  <span className="hidden sm:inline">{t("Assistant")}</span>
                </Link>
              </Button>
            )}
            {canEdit && (
              <>
                <ResultFormDialog
                  projectId={result.project_id}
                  result={result}
                  experiments={experiments}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label={t("Edit")}>
                      <Pencil />
                    </Button>
                  }
                />
                <Button variant="ghost" size="icon" aria-label={t("Delete")} disabled={pending} onClick={remove}>
                  <Trash2 />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className={`whitespace-pre-line text-sm text-muted-foreground ${expanded ? "" : "line-clamp-6"}`}>
          {result.content}
        </p>
        {long && (
          <Button variant="link" size="sm" className="mt-1 h-auto p-0" onClick={() => setExpanded((v) => !v)}>
            {expanded ? t("Show less") : t("Read more")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
