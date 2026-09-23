"use client";

import { useState } from "react";
import { BookOpen, HelpCircle, Lightbulb, ListChecks, Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AiDisclaimer } from "@/components/shared/ai-disclaimer";
import { NativeSelect } from "@/components/shared/native-select";
import type { AssistantOperation, AssistantResponse } from "@/lib/ai/schemas";
import type { ResearchResult } from "@/types";
import { useT } from "@/lib/i18n/provider";

const OPERATIONS: { value: AssistantOperation; label: string; icon: typeof Sparkles; hint: string }[] = [
  { value: "summarize", label: "Summarize", icon: BookOpen, hint: "Short summary with key points" },
  { value: "explain", label: "Explain", icon: HelpCircle, hint: "Plain-language explanation" },
  { value: "review", label: "Review structure", icon: ListChecks, hint: "Unclear parts, missing sections, weak logic" },
  { value: "suggest_questions", label: "Research questions", icon: Lightbulb, hint: "Follow-up questions and directions" },
  { value: "improve", label: "Improve", icon: Wand2, hint: "Concrete, actionable edits" },
];

type Source = { kind: "project" } | { kind: "result"; id: string } | { kind: "text" };

type Props = {
  projectId: string;
  results: Pick<ResearchResult, "id" | "title">[];
  initialResultId?: string;
  aiConfigured: boolean;
};

export function AssistantPanel({ projectId, results, initialResultId, aiConfigured }: Props) {
  const t = useT();
  const [source, setSource] = useState<string>(initialResultId ? `result:${initialResultId}` : "project");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState<AssistantOperation | null>(null);
  const [response, setResponse] = useState<(AssistantResponse & { operation: AssistantOperation }) | null>(null);

  function parseSource(): Source {
    if (source === "project") return { kind: "project" };
    if (source === "text") return { kind: "text" };
    return { kind: "result", id: source.slice("result:".length) };
  }

  async function run(operation: AssistantOperation) {
    const s = parseSource();
    if (s.kind === "text" && !text.trim()) return toast.error(t("Paste some text first."));

    setLoading(operation);
    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          operation,
          resultId: s.kind === "result" ? s.id : undefined,
          text: s.kind === "text" ? text : undefined,
        }),
      });
      const data = (await res.json()) as Partial<AssistantResponse> & { error?: string };
      if (!res.ok || !data.title || !data.content) throw new Error(data.error ?? t("Request failed"));
      setResponse({ title: data.title, content: data.content, points: data.points ?? [], operation });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("Request failed"));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="grid content-start gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("What to work with")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <NativeSelect value={source} onChange={(e) => setSource(e.target.value)} aria-label={t("Source")}>
              <option value="project">{t("Project description & plan")}</option>
              {results.length > 0 && (
                <optgroup label={t("Research results")}>
                  {results.map((r) => (
                    <option key={r.id} value={`result:${r.id}`}>
                      {r.title}
                    </option>
                  ))}
                </optgroup>
              )}
              <option value="text">{t("Pasted text")}</option>
            </NativeSelect>
            {source === "text" && (
              <Textarea
                rows={10}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("Paste a section of your research text here…")}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Actions")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {OPERATIONS.map(({ value, label, icon: Icon, hint }) => (
              <Button
                key={value}
                variant="outline"
                className="h-auto justify-start py-2.5"
                disabled={loading !== null || !aiConfigured}
                onClick={() => run(value)}
              >
                {loading === value ? <Loader2 className="animate-spin" /> : <Icon className="text-primary" />}
                <span className="text-left">
                  <span className="block font-medium">{t(label)}</span>
                  <span className="block text-xs font-normal text-muted-foreground">{t(hint)}</span>
                </span>
              </Button>
            ))}
            {!aiConfigured && <p className="text-xs text-muted-foreground">{t("AI_API_KEY is not configured on this server.")}</p>}
          </CardContent>
        </Card>
      </div>

      <div>
        {loading && (
          <Card>
            <CardContent className="grid gap-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
            </CardContent>
          </Card>
        )}

        {!loading && !response && (
          <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
            <Sparkles className="mb-3 size-8 text-primary" />
            <p className="font-medium">{t("Choose a source and an action")}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {t("The assistant works only with your project content and labels everything as AI assistance.")}
            </p>
          </div>
        )}

        {!loading && response && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                {response.title}
              </CardTitle>
              <AiDisclaimer />
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="whitespace-pre-line text-sm leading-relaxed">{response.content}</div>
              {response.points.length > 0 && (
                <ul className="grid gap-2 rounded-lg bg-muted/60 p-4 text-sm">
                  {response.points.map((p, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
