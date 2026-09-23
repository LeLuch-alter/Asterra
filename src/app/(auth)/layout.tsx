import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { OrbitScene } from "@/components/shared/orbit-scene";
import { publicEnv } from "@/lib/env";
import { NotConfigured } from "@/components/shared/not-configured";
import { getT } from "@/lib/i18n/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (!publicEnv.supabaseConfigured) return <NotConfigured />;
  const t = await getT();

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Left: form column */}
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" />
              {t("Home")}
            </Link>
          </div>
        </div>
        <div className="flex flex-1 items-center py-12">
          <div className="mx-auto w-full max-w-sm">{children}</div>
        </div>
        <p className="eyebrow">{t("Real research. Real people.")}</p>
      </div>

      {/* Right: animated plate (desktop only) */}
      <aside className="relative hidden overflow-hidden border-l bg-card lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="flex items-start justify-between">
          <p className="eyebrow">
            {t("Science")} <span className="mx-1 text-border">/</span> {t("Collaboration")} <span className="mx-1 text-border">/</span> {t("Impact")}
          </p>
          <ul className="eyebrow space-y-1 text-right">
            <li>{t("Research")}</li>
            <li>{t("Ideas")}</li>
            <li>{t("People")}</li>
            <li>{t("Impact")}</li>
          </ul>
        </div>
        <OrbitScene className="mx-auto max-w-[560px]" />
        <p className="display max-w-md text-4xl">
          {t("Where research becomes")} <em>{t("momentum.")}</em>
        </p>
      </aside>
    </div>
  );
}
