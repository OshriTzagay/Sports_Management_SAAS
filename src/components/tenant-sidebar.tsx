"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutTenant } from "@/features/tenant-auth/actions";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/", label: "בית", icon: LayoutDashboard },
  { href: "/seasons", label: "עונות", icon: CalendarDays },
  { href: "/teams", label: "קבוצות", icon: Users },
  { href: "/players", label: "שחקנים", icon: UserRound },
  { href: "/coaches", label: "מאמנים", icon: ClipboardList },
  { href: "/settings", label: "הגדרות", icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function TenantSidebar({
  userEmail,
  activeSeasonName,
  clubName,
  logoUrl,
}: {
  userEmail: string;
  activeSeasonName: string | null;
  clubName: string | null;
  logoUrl: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="border-border bg-bg-surface flex w-60 shrink-0 flex-col border-e">
      <div className="border-border flex items-center gap-3 border-b px-5 py-4">
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            className="border-border size-9 shrink-0 rounded-full border object-cover"
          />
        )}
        <div className="min-w-0">
          <p className="text-text-primary truncate text-sm font-bold">
            {clubName ?? "מערכת המועדון"}
          </p>
          <p className="text-text-muted mt-0.5 text-xs">
            עונה: {activeSeasonName ?? "—"}
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-text-body hover:bg-bg-muted",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-border flex flex-col gap-2 border-t p-3">
        <ThemeToggle />
        <p className="text-text-muted truncate px-3 text-xs">{userEmail}</p>
        <form action={signOutTenant}>
          <button
            type="submit"
            className="text-text-body hover:bg-bg-muted flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
          >
            <LogOut className="size-4 shrink-0" />
            התנתקות
          </button>
        </form>
      </div>
    </aside>
  );
}
