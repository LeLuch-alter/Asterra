"use client";

import Link from "next/link";
import { useState } from "react";
import { GraduationCap, Loader2, Sparkles, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AiDisclaimer } from "@/components/shared/ai-disclaimer";
import { EmptyState } from "@/components/shared/empty-state";
import { TagList } from "@/components/shared/tag-list";
import { UserAvatar } from "@/components/shared/user-avatar";
import { AddMemberDialog } from "@/components/project/add-member-dialog";
import { USER_ROLE_LABELS, type MatchCandidate } from "@/types";

type Mode = "collaborators" | "mentors";

type Props = { projectId: string; isOwner: boolean; memberIds: string[]; aiConfigured: boolean };

export function MatchPanel({ projectId, isOwner, memberIds, aiConfigured }: Props) {
  const [mode, setMode] = useState<Mode>("collaborators");
  const [matches, setMatches] = useState<MatchCandidate[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(next: Mode) {
    setMode(next);
    setLoading(true);
    setMatches(null);
    try {
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, lookingFor: next }),
      });
      const data = (await res.json()) as { matches?: MatchCandidate[]; error?: string };
      if (!res.ok || !data.matches) throw new Error(data.error ?? "Matching failed");
      setMatches(data.matches);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Matching failed");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Who are you looking for?</p>
            <p className="text-sm text-muted-foreground">
              AI compares the project with researcher profiles: fields, skills, interests and experience.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant={mode === "collaborators" ? "default" : "outline"} disabled={loading || !aiConfigured} onClick={() => run("collaborators")}>
              {loading && mode === "collaborators" ? <Loader2 className="animate-spin" /> : <Users />}
              Collaborators
            </Button>
            <Button variant={mode === "mentors" ? "default" : "outline"} disabled={loading || !aiConfigured} onClick={() => run("mentors")}>
              {loading && mode === "mentors" ? <Loader2 className="animate-spin" /> : <GraduationCap />}
              Mentors
            </Button>
          </div>
        </CardContent>
      </Card>

      {!aiConfigured && (
        <p className="text-sm text-muted-foreground">AI is not configured on this server (AI_API_KEY is missing).</p>
      )}

      {loading && (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      )}

      {matches && matches.length === 0 && !loading && (
        <EmptyState
          icon={Sparkles}
          title="No suitable matches found"
          description="Try adding more detail to the project description and required skills, or check back when more researchers join."
        />
      )}

      {matches && matches.length > 0 && (
        <div className="grid gap-3">
          <AiDisclaimer />
          {matches.map((m) => (
            <Card key={m.candidate.id}>
              <CardContent className="flex flex-col gap-4 sm:flex-row">
                <div className="flex items-start gap-3 sm:w-64 sm:shrink-0">
                  <UserAvatar name={m.candidate.full_name} src={m.candidate.avatar_url} className="size-11" />
                  <div className="min-w-0">
                    <Link href={`/researchers/${m.candidate.id}`} className="font-semibold hover:underline">
                      {m.candidate.full_name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {USER_ROLE_LABELS[m.candidate.role]}
                      {m.candidate.organization && ` · ${m.candidate.organization}`}
                    </p>
                    <Badge className="mt-2" variant="secondary">
                      ~{m.score}% fit
                    </Badge>
                  </div>
                </div>

                <div className="min-w-0 flex-1 text-sm">
                  <p>{m.summary}</p>
                  {(m.overlapping_fields.length > 0 || m.overlapping_skills.length > 0) && (
                    <div className="mt-3 grid gap-1.5">
                      {m.overlapping_fields.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Field overlap:</span> {m.overlapping_fields.join(", ")}
                        </p>
                      )}
                      {m.overlapping_skills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Skills:</span>
                          <TagList tags={m.candidate.skills} max={6} variant="outline" highlight={m.overlapping_skills} />
                        </div>
                      )}
                    </div>
                  )}
                  {m.experience_note && <p className="mt-2 text-xs text-muted-foreground">{m.experience_note}</p>}
                </div>

                {isOwner && !memberIds.includes(m.candidate.id) && (
                  <div className="sm:self-center">
                    <AddMemberDialog
                      projectId={projectId}
                      existingIds={memberIds}
                      preselected={m.candidate}
                      trigger={
                        <Button size="sm" variant="outline">
                          <UserPlus />
                          Add to project
                        </Button>
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
