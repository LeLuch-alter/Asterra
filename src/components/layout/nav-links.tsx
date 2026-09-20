"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, FolderKanban, LayoutDashboard, Newspaper, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const APP_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/researchers", label: "Researchers", icon: Users },
  { href: "/news", label: "Science news", icon: Newspaper },
  { href: "/notifications", label: "Notifications", icon: Bell },
] as const;

export function NavLinks({ onNavigate, unread = 0 }: { onNavigate?: () => void; unread?: number }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {APP_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            <span className="flex-1">{label}</span>
            {href === "/notifications" && unread > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
