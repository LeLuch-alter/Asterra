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
import { MEMBER_ROLE_LABELS, RESEARCH_FIELD_LABELS, type ResearchVersion } from "@/types";
import type { ActivityWithActor } from "@/lib/supabase/queries/graph";
import { getLocale, getT } from "@/lib/i18n/server";
import type { Locale, Translator } from "@/lib/i18n/config";

type Payload = Record<string, string | undefined>;

function describe(type: string, p: Payload, t: Translator): { icon: LucideIcon; text: string } {
  switch (type) {
    case "project_created":
      return { icon: Rocket, text: t("Project “{title}” created", { title: p.title ?? "" }) };
    case "project_forked":
      return { icon: GitFork, text: t("Project forked from an existing research direction") };
    case "project_forked_by":
      return { icon: GitFork, text: t("Someone forked this research into a new direction") };
    case "member_joined":
      return { icon: UserPlus, text: t("{name} joined as {role}", { name: p.name ?? "", role: t(MEMBER_ROLE_LABELS[p.role as keyof typeof MEMBER_ROLE_LABELS] ?? String(p.role ?? "")).toLowerCase() }) };
    case "idea_updated":
      return {
        icon: Pencil,
        text: t("{field} updated to v{version}", {
          field: t(RESEARCH_FIELD_LABELS[(p.field ?? "title") as keyof typeof RESEARCH_FIELD_LABELS]),
          version: p.version ?? "",
        }),
      };
    case "status_changed":
      return { icon: Signpost, text: t("Project status changed to {status}", { status: String(p.status).replace("_", " ") }) };
    case "experiment_added":
      return { icon: FlaskConical, text: t("Experiment “{title}” added", { title: p.title ?? "" }) };
    case "result_added":
      return { icon: History, text: t("Result “{title}” published", { title: p.title ?? "" }) };
    case "source_added":
      return { icon: Library, text: t("Source “{title}” attached to the {target}", { title: p.title ?? "", target: String(p.target).replace("_", " ") }) };
    default:
      return { icon: History, text: type.replaceAll("_", " ") };
  }
}

/** Version history grouped per research field, newest first. */
function VersionHistory({ versions, t, locale }: { versions: ResearchVersion[]; t: Translator; locale: Locale }) {
  const fields = (["research_question", "hypothesis", "methodology", "title"] as const).filter((f) =>
    versions.some((v) => v.field === f && v.version > 1),
  );
  if (fields.length === 0) return null;

  return (
    <section className="mb-10">
      <p className="eyebrow mb-3">{t("How the idea changed")}</p>
      <div className="grid gap-4">
        {fields.map((field) => {
          const list = versions.filter((v) => v.field === field).sort((a, b) => b.version - a.version);
          return (
            <div key={field} className="rounded-xl border bg-card p-4">
              <p className="mb-3 font-medium">{t(RESEARCH_FIELD_LABELS[field])}</p>
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
                        {v.content || <span className="italic">{t("empty")}</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(v.created_at, undefined, locale)}</p>
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

export async function ResearchTimeline({ activity, versions }: { activity: ActivityWithActor[]; versions: ResearchVersion[] }) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return (
    <>
      <VersionHistory versions={versions} t={t} locale={locale} />

      <p className="eyebrow mb-3">{t("Activity")}</p>
      {activity.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          {t("Nothing has happened yet.")}
        </p>
      ) : (
        <ol className="relative border-l pl-6">
          {activity.map((a) => {
            const { icon: Icon, text } = describe(a.type, (a.payload ?? {}) as Payload, t);
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
                  <time dateTime={a.created_at}>{formatDate(a.created_at, undefined, locale)}</time>
                  <span className="text-border">·</span>
                  {timeAgo(a.created_at, locale)}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
