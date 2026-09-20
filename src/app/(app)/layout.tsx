import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries/profiles";
import { getUnreadCount } from "@/lib/supabase/queries/notifications";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");

  const [profile, unread] = await Promise.all([getProfile(user.id), getUnreadCount(user.id)]);
  if (!profile) redirect("/login");

  return (
    <AppShell profile={profile} email={user.email ?? ""} unread={unread}>
      {children}
    </AppShell>
  );
}
