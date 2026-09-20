import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";
import { SearchBox } from "./search-box";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export type NavBadges = { "/notifications"?: number; "/connections"?: number };

type Props = {
  profile: Profile;
  email: string;
  badges: NavBadges;
  children: React.ReactNode;
};

/** Sidebar + topbar layout for the signed-in area. */
export function AppShell({ profile, email, badges, children }: Props) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar px-4 py-5 md:flex">
        <Logo href="/dashboard" className="mb-8 px-2" />
        <NavLinks badges={badges} />
        <div className="mt-auto grid gap-3 pt-6">
          <Button asChild className="w-full">
            <Link href="/projects/new">
              <Plus />
              New project
            </Link>
          </Button>
          <p className="eyebrow whitespace-nowrap px-2">Real research. Real people.</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur sm:px-6">
          <MobileNav badges={badges} />
          <Logo href="/dashboard" className="md:hidden" showText={false} />
          <SearchBox className="hidden w-full max-w-md md:block" />
          <div className="ml-auto flex items-center gap-1">
            <Button asChild size="icon" variant="outline" className="md:hidden" aria-label="New project">
              <Link href="/projects/new">
                <Plus />
              </Link>
            </Button>
            <ThemeToggle />
            <UserMenu profile={profile} email={email} />
          </div>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
