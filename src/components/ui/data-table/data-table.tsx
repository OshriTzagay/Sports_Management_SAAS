"use client";

import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { DataTableColumn } from "./types";
import { useDataTable } from "./use-data-table";

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string | undefined;
  searchAccessor?: (row: T) => string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** גובה מקסימלי לאזור הגלילה (כותרת נשארת דביקה). */
  maxHeight?: string;
}

/** נגזרת אפשרויות פילטר מהנתונים כשלא סופקו במפורש. */
function filterOptions<T>(
  column: DataTableColumn<T>,
  rows: T[],
): { value: string; label: string }[] {
  if (!column.filter) return [];
  if (column.filter.options) return column.filter.options;
  const seen = new Set<string>();
  for (const row of rows) {
    const value = column.filter.value(row);
    if (value) seen.add(value);
  }
  return [...seen]
    .sort((a, b) => a.localeCompare(b, "he"))
    .map((v) => ({
      value: v,
      label: v,
    }));
}

/**
 * טבלת נתונים גנרית: חיפוש גלובלי, פילטרים פר-עמודה, מיון, גלילה עם כותרת דביקה.
 * הרינדור הייחודי של כל תא נשמר דרך column.cell.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  rowClassName,
  searchAccessor,
  searchPlaceholder = "חיפוש…",
  emptyMessage = "אין נתונים.",
  maxHeight = "70vh",
}: DataTableProps<T>) {
  const table = useDataTable(rows, columns, searchAccessor);
  const filterableColumns = columns.filter((c) => c.filter);

  if (rows.length === 0) {
    return <p className="text-text-muted text-sm">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          value={table.query}
          onChange={(e) => table.setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="max-w-xs"
        />
        {filterableColumns.map((col) => (
          <SearchableSelect
            key={col.key}
            value={table.filters[col.key] ?? ""}
            onChange={(v) => table.setFilter(col.key, v)}
            options={filterOptions(col, rows)}
            emptyLabel={`כל ${col.filter?.label ?? col.header}`}
            placeholder={col.filter?.label ?? col.header}
            className="w-44"
          />
        ))}
        <span className="text-text-muted ms-auto text-xs">
          {table.processedRows.length} מתוך {rows.length}
        </span>
        {table.hasActiveControls && (
          <button
            type="button"
            onClick={table.clearAll}
            className="text-text-muted hover:text-primary-700 text-xs underline"
          >
            ניקוי סינון
          </button>
        )}
      </div>

      {table.processedRows.length === 0 ? (
        <p className="text-text-muted text-sm">לא נמצאו תוצאות.</p>
      ) : (
        <div
          className="border-border bg-bg-surface overflow-auto rounded-lg border"
          style={{ maxHeight }}
        >
          <table className="w-full text-sm">
            <TableHeader className="sticky top-0 z-10">
              <TableRow>
                {columns.map((col) => {
                  const sorted = table.sortKey === col.key;
                  return (
                    <TableHead
                      key={col.key}
                      className={cn(
                        "bg-bg-surface",
                        col.align === "end" && "text-end",
                        col.headClassName,
                      )}
                    >
                      {col.sortValue ? (
                        <button
                          type="button"
                          onClick={() => table.toggleSort(col.key)}
                          className="hover:text-text-primary inline-flex items-center gap-1"
                        >
                          {col.header}
                          <span className="text-[0.65rem]">
                            {sorted
                              ? table.sortDir === "asc"
                                ? "▲"
                                : "▼"
                              : "↕"}
                          </span>
                        </button>
                      ) : (
                        col.header
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.processedRows.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    onRowClick && "cursor-pointer",
                    rowClassName?.(row),
                  )}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        col.align === "end" && "text-end",
                        col.cellClassName,
                      )}
                    >
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </table>
        </div>
      )}
    </div>
  );
}
