import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TagList } from "@/components/shared/tag-list";
import { UserAvatar } from "@/components/shared/user-avatar";
import { USER_ROLE_LABELS, type Profile } from "@/types";

type Props = { profile: Profile; action?: React.ReactNode };

export function ResearcherCard({ profile, action }: Props) {
  return (
    <article className="flex h-full gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/30">
      <UserAvatar name={profile.full_name} src={profile.avatar_url} className="size-12" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/researchers/${profile.id}`} className="font-semibold tracking-tight hover:underline">
              {profile.full_name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              {USER_ROLE_LABELS[profile.role]}
              {profile.organization && ` · ${profile.organization}`}
            </p>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {profile.is_mentor && (
          <Badge className="mt-2">
            <GraduationCap />
            Mentor
          </Badge>
        )}
        {profile.research_fields.length > 0 && (
          <p className="eyebrow eyebrow-accent mt-3 normal-case tracking-normal">{profile.research_fields.slice(0, 3).join(" · ")}</p>
        )}
        {profile.bio && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{profile.bio}</p>}
        {profile.skills.length > 0 && (
          <div className="mt-3">
            <TagList tags={profile.skills} max={5} variant="outline" />
          </div>
        )}
      </div>
    </article>
  );
}
