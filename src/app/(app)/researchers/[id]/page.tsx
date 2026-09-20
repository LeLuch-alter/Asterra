import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, GraduationCap, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagList } from "@/components/shared/tag-list";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ProjectCard } from "@/components/project/project-card";
import { getUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries/profiles";
import { getProjectsForUser } from "@/lib/supabase/queries/projects";
import { USER_ROLE_LABELS } from "@/types";

export default async function ResearcherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profile, user] = await Promise.all([getProfile(id), getUser()]);
  if (!profile) notFound();
  const projects = await getProjectsForUser(id);
  const isMe = user?.id === id;

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="grid content-start gap-6">
        <Card>
          <CardContent className="flex flex-col items-center text-center">
            <UserAvatar name={profile.full_name} src={profile.avatar_url} className="size-24 text-2xl" />
            <h1 className="mt-4 text-xl font-semibold">{profile.full_name}</h1>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Badge variant="outline">{USER_ROLE_LABELS[profile.role]}</Badge>
              {profile.is_mentor && (
                <Badge>
                  <GraduationCap />
                  Mentor
                </Badge>
              )}
            </div>
            {profile.organization && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="size-4" />
                {profile.organization}
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.experience_years} {profile.experience_years === 1 ? "year" : "years"} of research experience
            </p>
            {isMe && (
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href="/profile">
                  <Pencil />
                  Edit profile
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {(profile.research_fields.length > 0 || profile.skills.length > 0 || profile.interests.length > 0) && (
          <Card>
            <CardContent className="grid gap-4">
              {profile.research_fields.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Research fields</h3>
                  <TagList tags={profile.research_fields} max={20} variant="default" />
                </div>
              )}
              {profile.skills.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Skills</h3>
                  <TagList tags={profile.skills} max={30} />
                </div>
              )}
              {profile.interests.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Interests</h3>
                  <TagList tags={profile.interests} max={30} variant="outline" />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid content-start gap-6">
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {profile.bio || "This researcher has not written a bio yet."}
            </p>
          </CardContent>
        </Card>

        <section>
          <h2 className="mb-3 font-semibold">Projects ({projects.length})</h2>
          {projects.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No projects yet.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
