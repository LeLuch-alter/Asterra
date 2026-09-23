import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, GraduationCap, MessageSquare, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TagList } from "@/components/shared/tag-list";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ProjectCard } from "@/components/project/project-card";
import { ConnectButton } from "@/components/researcher/connect-button";
import { getUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries/profiles";
import { getProjectsForUser } from "@/lib/supabase/queries/projects";
import { getBookmarkedIds, getConnectionState } from "@/lib/supabase/queries/social";
import { USER_ROLE_LABELS } from "@/types";

export default async function ResearcherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profile, user] = await Promise.all([getProfile(id), getUser()]);
  if (!profile || !user) notFound();
  const [projects, state, bookmarked] = await Promise.all([
    getProjectsForUser(id),
    getConnectionState(user.id, id),
    getBookmarkedIds(user.id),
  ]);
  const isMe = user.id === id;

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      <aside className="grid content-start gap-6">
        <div className="rounded-xl border bg-card p-6 text-center">
          <UserAvatar name={profile.full_name} src={profile.avatar_url} className="mx-auto size-28 text-3xl" />
          <h1 className="display mt-5 text-3xl">{profile.full_name}</h1>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Badge variant="outline">{USER_ROLE_LABELS[profile.role]}</Badge>
            {profile.is_mentor && (
              <Badge>
                <GraduationCap />
                Mentor
              </Badge>
            )}
          </div>
          {profile.organization && (
            <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="size-4" />
              {profile.organization}
            </p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {profile.experience_years} {profile.experience_years === 1 ? "year" : "years"} of research experience
          </p>
          <div className="mt-5 flex justify-center gap-2">
            {isMe ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/profile">
                  <Pencil />
                  Edit profile
                </Link>
              </Button>
            ) : (
              <>
                <ConnectButton otherId={id} state={state} size="default" />
                {state.kind === "connected" && (
                  <Button asChild variant="outline">
                    <Link href={`/messages/${id}`}>
                      <MessageSquare />
                      Message
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {(profile.research_fields.length > 0 || profile.skills.length > 0 || profile.interests.length > 0) && (
          <div className="grid gap-5 rounded-xl border bg-card p-6">
            {profile.research_fields.length > 0 && (
              <div>
                <p className="eyebrow mb-2">Research fields</p>
                <TagList tags={profile.research_fields} max={20} variant="default" />
              </div>
            )}
            {profile.skills.length > 0 && (
              <div>
                <p className="eyebrow mb-2">Skills</p>
                <TagList tags={profile.skills} max={30} />
              </div>
            )}
            {profile.interests.length > 0 && (
              <div>
                <p className="eyebrow mb-2">Interests</p>
                <TagList tags={profile.interests} max={30} variant="outline" />
              </div>
            )}
          </div>
        )}
      </aside>

      <div className="grid content-start gap-8">
        <section>
          <p className="eyebrow mb-2">About</p>
          <p className="reading whitespace-pre-line text-muted-foreground">{profile.bio || "This researcher has not written a bio yet."}</p>
        </section>

        <section>
          <p className="eyebrow mb-3">Projects · {projects.length}</p>
          {projects.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No projects yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} bookmarked={bookmarked.has(p.id)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
