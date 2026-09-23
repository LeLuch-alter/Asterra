import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { SearchBox } from "./search-box";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "News" },
  { href: "/projects", label: "Projects" },
  { href: "/researchers", label: "Researchers" },
];

/** Header for public pages (news home, auth). */
export async function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const t = await getT();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t(n.label)}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <SearchBox className="hidden w-56 sm:block" />
          <LanguageSwitcher />
          <ThemeToggle />
          {signedIn ? (
            <Button asChild variant="outline">
              <Link href="/dashboard">{t("Dashboard")}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">{t("Sign in")}</Link>
              </Button>
              <Button asChild>
                <Link href="/register">{t("Join")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
