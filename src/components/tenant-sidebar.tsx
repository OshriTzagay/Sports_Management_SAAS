"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
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
import { SeasonSwitcher } from "@/components/season-switcher";
import { signOutTenant } from "@/features/tenant-auth/actions";
import type { Season } from "@/features/seasons";

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
  seasons,
  selectedSeasonId,
  clubName,
  logoUrl,
}: {
  userEmail: string;
  seasons: Season[];
  selectedSeasonId: string | null;
  clubName: string | null;
  logoUrl: string | null;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(localStorage.getItem("sidebar-collapsed") === "1");
  }, []);

  const toggle = () =>
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("sidebar-collapsed", next ? "1" : "0");
      return next;
    });

  return (
    <aside
      className={cn(
        "border-border bg-bg-surface flex shrink-0 flex-col border-e transition-[width] duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div
        className={cn(
          "border-border flex items-center gap-2 border-b py-4",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        {!collapsed && logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            className="border-border size-9 shrink-0 rounded-full border object-cover"
          />
        )}
        {!collapsed && (
          <p className="text-text-primary min-w-0 flex-1 truncate text-sm font-bold">
            {clubName ?? "מערכת המועדון"}
          </p>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "הרחבת התפריט" : "כיווץ התפריט"}
          className="text-text-muted hover:text-text-primary"
        >
          {collapsed ? (
            <ChevronLeft className="size-5" />
          ) : (
            <ChevronRight className="size-5" />
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="border-border flex flex-col gap-1 border-b px-4 py-3">
          <span className="text-text-muted text-xs">עונה</span>
          <SeasonSwitcher seasons={seasons} selectedId={selectedSeasonId} />
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md py-2 text-sm transition-colors",
                collapsed ? "justify-center px-0" : "px-3",
                active
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-text-body hover:bg-bg-muted",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "border-border flex flex-col gap-2 border-t p-2",
          collapsed && "items-center",
        )}
      >
        {!collapsed && <ThemeToggle />}
        {!collapsed && (
          <p className="text-text-muted truncate px-3 text-xs">{userEmail}</p>
        )}
        <form
          action={signOutTenant}
          className={collapsed ? undefined : "w-full"}
        >
          <button
            type="submit"
            title="התנתקות"
            className={cn(
              "text-text-body hover:bg-bg-muted flex items-center gap-3 rounded-md py-2 text-sm transition-colors",
              collapsed ? "justify-center px-2" : "w-full px-3",
            )}
          >
            <LogOut className="size-4 shrink-0" />
            {!collapsed && "התנתקות"}
          </button>
        </form>
      </div>
    </aside>
  );
}
