import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { getT } from "@/lib/i18n/server";

export default async function NotFound() {
  const t = await getT();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Logo />
      <h1 className="text-2xl font-semibold">{t("Page not found")}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t("The page does not exist, or you do not have access to this project.")}
      </p>
      <Button asChild>
        <Link href="/dashboard">{t("Go to dashboard")}</Link>
      </Button>
    </div>
  );
}
