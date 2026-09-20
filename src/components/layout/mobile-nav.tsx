"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";

export function MobileNav({ unread }: { unread: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-4">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <Logo href="/dashboard" className="mb-6" />
        <NavLinks onNavigate={() => setOpen(false)} unread={unread} />
      </SheetContent>
    </Sheet>
  );
}
