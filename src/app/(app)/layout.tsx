import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getUser } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import { NotConfigured } from "@/components/shared/not-configured";
import { getProfile } from "@/lib/supabase/queries/profiles";
import { getUnreadCount } from "@/lib/supabase/queries/notifications";
import { getIncomingConnectionCount } from "@/lib/supabase/queries/social";
import { getUnreadMessageCount } from "@/lib/supabase/queries/messages";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!publicEnv.supabaseConfigured) return <NotConfigured />;
  const user = await getUser();
  if (!user) redirect("/login");

  const [profile, unread, incoming, unreadMessages] = await Promise.all([
    getProfile(user.id),
    getUnreadCount(user.id),
    getIncomingConnectionCount(user.id),
    getUnreadMessageCount(user.id),
  ]);
  if (!profile) redirect("/login");

  return (
    <AppShell profile={profile} email={user.email ?? ""} badges={{ "/notifications": unread, "/connections": incoming, "/messages": unreadMessages }}>
      {children}
    </AppShell>
  );
}
