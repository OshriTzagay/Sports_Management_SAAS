"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const OPTIONS: { value: string; icon: LucideIcon; label: string }[] = [
  { value: "light", icon: Sun, label: "בהיר" },
  { value: "dark", icon: Moon, label: "כהה" },
  { value: "system", icon: Monitor, label: "מערכת" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // hydration-safe: theme is unknown on the server, so read it only after mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <div className="border-border flex gap-0.5 rounded-md border p-0.5">
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-label={label}
            aria-pressed={active}
            className={cn(
              "flex flex-1 items-center justify-center rounded-sm py-1.5 transition-colors",
              active
                ? "bg-primary-50 text-primary-700"
                : "text-text-muted hover:text-text-primary",
            )}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
