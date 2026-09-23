import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/components/researcher/profile-form";
import { AvatarUpload } from "@/components/researcher/avatar-upload";
import { getUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries/profiles";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Edit profile" };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/login");
  const profile = await getProfile(user.id);
  if (!profile) redirect("/login");
  const t = await getT();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow={welcome ? t("Step 1 of 1") : t("Your profile")}
        title={
          welcome ? (
            <>
              {t("Welcome to")} <em>Asterra.</em>
            </>
          ) : (
            t("Researcher profile")
          )
        }
        description={
          welcome
            ? t("Tell others about your research fields and skills — this is what AI Match uses to recommend you.")
            : t("This information is visible to other researchers and used by AI Match.")
        }
      />
      <div className="mb-6 rounded-xl border bg-card p-5">
        <p className="eyebrow mb-4">{t("Photo")}</p>
        <AvatarUpload name={profile.full_name} avatarUrl={profile.avatar_url} />
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
