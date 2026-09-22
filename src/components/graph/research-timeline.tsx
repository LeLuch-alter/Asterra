import Link from "next/link";
import {
  FlaskConical,
  GitFork,
  History,
  Library,
  Pencil,
  Rocket,
  Signpost,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatDate, timeAgo } from "@/lib/format";
import { RESEARCH_FIELD_LABELS, type ResearchVersion } from "@/types";
import type { ActivityWithActor } from "@/lib/supabase/queries/graph";

type Payload = Record<string, string | undefined>;

function describe(type: string, p: Payload): { icon: LucideIcon; text: string } {
  switch (type) {
    case "project_created":
      return { icon: Rocket, text: `Project “${p.title}” created` };
    case "project_forked":
      return { icon: GitFork, text: `Project forked from an existing research direction` };
    case "project_forked_by":
      return { icon: GitFork, text: "Someone forked this research into a new direction" };
    case "member_joined":
      return { icon: UserPlus, text: `${p.name} joined as ${p.role}` };
    case "idea_updated":
      return {
        icon: Pencil,
        text: `${RESEARCH_FIELD_LABELS[(p.field ?? "title") as keyof typeof RESEARCH_FIELD_LABELS]} updated to v${p.version}`,
      };
    case "status_changed":
      return { icon: Signpost, text: `Project status changed to ${String(p.status).replace("_", " ")}` };
    case "experiment_added":
      return { icon: FlaskConical, text: `Experiment “${p.title}” added` };
    case "result_added":
      return { icon: History, text: `Result “${p.title}” published` };
    case "source_added":
      return { icon: Library, text: `Source “${p.title}” attached to the ${String(p.target).replace("_", " ")}` };
    default:
      return { icon: History, text: type.replaceAll("_", " ") };
  }
}

/** Version history grouped per research field, newest first. */
function VersionHistory({ versions }: { versions: ResearchVersion[] }) {
  const fields = (["research_question", "hypothesis", "methodology", "title"] as const).filter((f) =>
    versions.some((v) => v.field === f && v.version > 1),
  );
  if (fields.length === 0) return null;

  return (
    <section className="mb-10">
      <p className="eyebrow mb-3">How the idea changed</p>
      <div className="grid gap-4">
        {fields.map((field) => {
          const list = versions.filter((v) => v.field === field).sort((a, b) => b.version - a.version);
          return (
            <div key={field} className="rounded-xl border bg-card p-4">
              <p className="mb-3 font-medium">{RESEARCH_FIELD_LABELS[field]}</p>
              <ol className="grid gap-3">
                {list.map((v, i) => (
                  <li key={v.id} className="grid grid-cols-[auto_1fr] gap-3">
                    <span
                      className={`mt-0.5 rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                        i === 0 ? "border-primary text-primary" : "text-muted-foreground"
                      }`}
                    >
                      v{v.version}
                    </span>
                    <div>
                      <p className={`text-sm ${i === 0 ? "" : "text-muted-foreground line-through decoration-border"}`}>
                        {v.content || <span className="italic">empty</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(v.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ResearchTimeline({ activity, versions }: { activity: ActivityWithActor[]; versions: ResearchVersion[] }) {
  return (
    <>
      <VersionHistory versions={versions} />

      <p className="eyebrow mb-3">Activity</p>
      {activity.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nothing has happened yet.
        </p>
      ) : (
        <ol className="relative border-l pl-6">
          {activity.map((a) => {
            const { icon: Icon, text } = describe(a.type, (a.payload ?? {}) as Payload);
            return (
              <li key={a.id} className="relative pb-6 last:pb-0">
                <span className="absolute -left-[31px] flex size-6 items-center justify-center rounded-full border bg-card">
                  <Icon className="size-3 text-primary" />
                </span>
                <p className="text-sm">{text}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  {a.actor && (
                    <>
                      <UserAvatar name={a.actor.full_name} src={a.actor.avatar_url} className="size-4" />
                      <Link href={`/researchers/${a.actor.id}`} className="hover:underline">
                        {a.actor.full_name}
                      </Link>
                      ·
                    </>
                  )}
                  <time dateTime={a.created_at}>{formatDate(a.created_at)}</time>
                  <span className="text-border">·</span>
                  {timeAgo(a.created_at)}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
