import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TagList } from "@/components/shared/tag-list";
import { UserAvatar } from "@/components/shared/user-avatar";
import { USER_ROLE_LABELS, type Profile } from "@/types";

export function ResearcherCard({ profile }: { profile: Profile }) {
  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardContent className="flex gap-4">
        <UserAvatar name={profile.full_name} src={profile.avatar_url} className="size-12" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/researchers/${profile.id}`} className="font-semibold hover:underline">
              {profile.full_name}
            </Link>
            <Badge variant="outline">{USER_ROLE_LABELS[profile.role]}</Badge>
            {profile.is_mentor && (
              <Badge>
                <GraduationCap />
                Mentor
              </Badge>
            )}
          </div>
          {profile.organization && <p className="text-sm text-muted-foreground">{profile.organization}</p>}
          {profile.research_fields.length > 0 && (
            <p className="mt-1 text-xs font-medium text-primary">{profile.research_fields.slice(0, 3).join(" · ")}</p>
          )}
          {profile.bio && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{profile.bio}</p>}
          {profile.skills.length > 0 && (
            <div className="mt-3">
              <TagList tags={profile.skills} max={5} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
