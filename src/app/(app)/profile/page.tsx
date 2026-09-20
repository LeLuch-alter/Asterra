import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/components/researcher/profile-form";
import { getUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries/profiles";

export const metadata: Metadata = { title: "Edit profile" };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/login");
  const profile = await getProfile(user.id);
  if (!profile) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={welcome ? "Welcome to Asterra" : "Your researcher profile"}
        description={
          welcome
            ? "Tell others about your research fields and skills — this is what AI Match uses to recommend you."
            : "This information is visible to other researchers and used by AI Match."
        }
      />
      <ProfileForm profile={profile} />
    </div>
  );
}
