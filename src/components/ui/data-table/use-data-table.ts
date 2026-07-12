"use client";

import { useState } from "react";

import type { DataTableColumn } from "./types";

export type SortDir = "asc" | "desc";

/**
 * מצב + נגזרות של הטבלה: פילטרים פר-עמודה, חיפוש גלובלי, מיון.
 * בלי memo ידני — React Compiler ממזכר; החישוב אינליין נשאר קריא.
 */
export function useDataTable<T>(
  rows: T[],
  columns: DataTableColumn<T>[],
  searchAccessor?: (row: T) => string,
) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const searchText =
    searchAccessor ??
    ((row: T) =>
      columns
        .map((col) => (col.sortValue ? String(col.sortValue(row)) : ""))
        .join(" "));

  // סינון פר-עמודה → חיפוש גלובלי → מיון.
  let result = rows;

  for (const col of columns) {
    const active = filters[col.key];
    if (col.filter && active) {
      result = result.filter((row) => col.filter!.value(row) === active);
    }
  }

  const q = query.trim().toLowerCase();
  if (q) {
    result = result.filter((row) => searchText(row).toLowerCase().includes(q));
  }

  if (sortKey) {
    const col = columns.find((c) => c.key === sortKey);
    if (col?.sortValue) {
      const dir = sortDir === "asc" ? 1 : -1;
      result = [...result].sort((a, b) => {
        const av = col.sortValue!(a);
        const bv = col.sortValue!(b);
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv), "he");
        return cmp * dir;
      });
    }
  }

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
    }
  }

  function setFilter(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearAll() {
    setQuery("");
    setSortKey(null);
    setFilters({});
  }

  const hasActiveControls =
    q !== "" || sortKey !== null || Object.values(filters).some(Boolean);

  return {
    query,
    setQuery,
    sortKey,
    sortDir,
    toggleSort,
    filters,
    setFilter,
    clearAll,
    hasActiveControls,
    processedRows: result,
  };
}
