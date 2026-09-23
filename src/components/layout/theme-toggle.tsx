"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";

/**
 * Light/dark switch. Both icons are rendered and CSS picks the visible one via the
 * `.dark` class, so there is no hydration mismatch and no mounted-state effect.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useT();
  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label={t("Toggle theme")}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  );
}
