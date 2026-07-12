"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** תווית לאפשרות "ריקה" (מאפשר בחירה של ערך "" — למשל "ללא"). */
  emptyLabel?: string;
  /** שם לשדה נסתר — לשליחה בטופס native (FormData). */
  name?: string;
  disabled?: boolean;
  className?: string;
  searchPlaceholder?: string;
}

/**
 * קומבובוקס עם חיפוש — RTL, ניווט מקלדת, סינון בהקלדה.
 * מחליף <select> כשהרשימה עשויה להתארך. תואם טפסים דרך שדה נסתר (name).
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "בחירה…",
  emptyLabel,
  name,
  disabled = false,
  className,
  searchPlaceholder = "חיפוש…",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const allOptions = useMemo<SelectOption[]>(
    () =>
      emptyLabel !== undefined
        ? [{ value: "", label: emptyLabel }, ...options]
        : options,
    [options, emptyLabel],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allOptions;
    return allOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [allOptions, query]);

  const selectedLabel = allOptions.find((o) => o.value === value)?.label;

  // סגירה בלחיצה מחוץ לרכיב.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function toggle() {
    if (!open) {
      setQuery("");
      setHighlight(0);
    }
    setOpen((o) => !o);
  }

  function commit(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const option = filtered[highlight];
      if (option) commit(option);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "border-border bg-bg-surface text-text-primary flex h-10 w-full items-center justify-between gap-2 rounded-md border px-3 text-sm transition-colors outline-none",
          "focus-visible:border-primary-300 focus-visible:ring-primary-300/40 focus-visible:ring-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <span className={cn(!selectedLabel && "text-text-muted", "truncate")}>
          {selectedLabel ?? placeholder}
        </span>
        <span className="text-text-muted shrink-0 text-xs">▾</span>
      </button>

      {open && (
        <div className="border-border bg-bg-surface absolute z-50 mt-1 w-full overflow-hidden rounded-md border shadow-lg">
          <div className="border-border border-b p-1.5">
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlight(0);
              }}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              className="border-border bg-bg-surface text-text-primary focus-visible:border-primary-300 h-8 w-full rounded-md border px-2 text-sm outline-none"
            />
          </div>
          <ul
            id={listId}
            role="listbox"
            className="max-h-56 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="text-text-muted px-3 py-2 text-sm">אין תוצאות</li>
            ) : (
              filtered.map((option, i) => (
                <li key={option.value || "__empty"}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => commit(option)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-start text-sm",
                      i === highlight && "bg-bg-muted",
                      option.value === value
                        ? "text-primary-700 font-medium"
                        : "text-text-primary",
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {option.value === value && (
                      <span className="text-primary-700 text-xs">✓</span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
