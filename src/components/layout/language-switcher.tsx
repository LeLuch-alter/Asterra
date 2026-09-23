"use client";

import { useTransition } from "react";
import { Check, Languages } from "lucide-react";
import { setLocale } from "@/actions/locale";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALES, LOCALE_LABELS, LOCALE_SHORT } from "@/lib/i18n/config";
import { useLocale, useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Switches the interface language. Research content stays in English —
 * only labels, navigation and helper text are translated.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useT();
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className} aria-label={t("Change language")} disabled={pending}>
          <Languages />
          <span className="sr-only">{LOCALE_SHORT[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{t("Interface language")}</p>
          <p className="text-xs text-muted-foreground">{t("Research content stays in English.")}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LOCALES.map((value) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => startTransition(() => setLocale(value))}
            className={cn(value === locale && "font-medium")}
          >
            <Check className={cn("size-4", value !== locale && "opacity-0")} />
            {LOCALE_LABELS[value]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
