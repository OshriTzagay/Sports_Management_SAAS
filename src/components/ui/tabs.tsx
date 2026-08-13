"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface TabItem {
  key: string;
  label: string;
  /** מונה אופציונלי לצד התווית (מספר שורות בטבלה). */
  count?: number;
  /** פעולה קונטקסטואלית שמופיעה בקצה בעת שהטאב פעיל (למשל כפתור יצירה). */
  toolbar?: ReactNode;
  content: ReactNode;
}

/**
 * Tabs בסגנון underline — שורת ניווט בהתחלה, פעולה קונטקסטואלית בקצה.
 * כל התכנים נשארים ב-DOM (מצב הסינון/מיון נשמר במעבר בין טאבים).
 */
export function Tabs({
  items,
  defaultKey,
}: {
  items: TabItem[];
  defaultKey?: string;
}) {
  const [active, setActive] = useState(defaultKey ?? items[0]?.key ?? "");
  const activeItem = items.find((item) => item.key === active);

  return (
    <div className="flex flex-col gap-4">
      <div className="border-border flex items-center justify-between gap-3 border-b">
        <div className="flex gap-1">
          {items.map((item) => {
            const isActive = item.key === active;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActive(item.key)}
                className={cn(
                  "-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "border-primary text-text-primary font-semibold"
                    : "text-text-muted hover:text-text-primary border-transparent",
                )}
              >
                {item.label}
                {item.count !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "bg-bg-muted text-text-muted",
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {activeItem?.toolbar}
      </div>

      {items.map((item) => (
        <div key={item.key} hidden={item.key !== active}>
          {item.content}
        </div>
      ))}
    </div>
  );
}
