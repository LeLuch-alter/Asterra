import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";
import { UserMenu } from "./user-menu";

type Props = {
  profile: Profile;
  email: string;
  unread: number;
  children: React.ReactNode;
};

/** Sidebar + topbar layout for the signed-in area. */
export function AppShell({ profile, email, unread, children }: Props) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar p-4 md:flex">
        <Logo href="/dashboard" className="mb-6 px-1" />
        <NavLinks unread={unread} />
        <div className="mt-auto pt-6">
          <Button asChild className="w-full">
            <Link href="/projects/new">
              <Plus />
              New project
            </Link>
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur">
          <MobileNav unread={unread} />
          <Logo href="/dashboard" className="md:hidden" showText={false} />
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="md:hidden">
              <Link href="/projects/new">
                <Plus />
                New
              </Link>
            </Button>
            <UserMenu profile={profile} email={email} />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
