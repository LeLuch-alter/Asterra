"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Bookmark, FolderKanban, LayoutDashboard, MessageSquare, Newspaper, Users, UsersRound } from "lucide-react";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export const APP_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/researchers", label: "Researchers", icon: Users },
  { href: "/connections", label: "Connections", icon: UsersRound },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/bookmarks", label: "Saved", icon: Bookmark },
  { href: "/news", label: "Science news", icon: Newspaper },
  { href: "/notifications", label: "Notifications", icon: Bell },
] as const;

type Props = { onNavigate?: () => void; badges?: Partial<Record<(typeof APP_NAV)[number]["href"], number>> };

export function NavLinks({ onNavigate, badges = {} }: Props) {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav className="flex flex-col gap-0.5">
      {APP_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        const badge = badges[href] ?? 0;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-full px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            <span className="flex-1">{t(label)}</span>
            {badge > 0 && (
              <span className="rounded-full bg-primary px-1.5 font-mono text-[10px] font-semibold text-primary-foreground">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
