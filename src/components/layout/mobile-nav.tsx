"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";
import { SearchBox } from "./search-box";
import type { NavBadges } from "./app-shell";
import { useT } from "@/lib/i18n/provider";

export function MobileNav({ badges }: { badges: NavBadges }) {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={t("Open menu")}>
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-4">
        <SheetTitle className="sr-only">{t("Navigation")}</SheetTitle>
        <Logo href="/dashboard" className="mb-6" />
        <SearchBox className="mb-4" />
        <NavLinks onNavigate={() => setOpen(false)} badges={badges} />
      </SheetContent>
    </Sheet>
  );
}
