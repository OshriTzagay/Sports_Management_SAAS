"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ClubStatusToggle } from "./club-status-toggle";
import type { Club } from "./types";

const STATUS: Record<
  Club["status"],
  { label: string; variant: "success" | "info" | "danger" }
> = {
  active: { label: "פעיל", variant: "success" },
  trial: { label: "ניסיון", variant: "info" },
  suspended: { label: "מושעה", variant: "danger" },
};

const columns: DataTableColumn<Club>[] = [
  {
    key: "name",
    header: "מועדון",
    cell: (c) => (
      <span className="text-text-primary font-medium">{c.name}</span>
    ),
    sortValue: (c) => c.name,
  },
  {
    key: "slug",
    header: "מזהה",
    cell: (c) => <span className="text-text-muted">{c.slug}</span>,
    sortValue: (c) => c.slug,
  },
  {
    key: "status",
    header: "סטטוס",
    cell: (c) => (
      <Badge variant={STATUS[c.status].variant}>{STATUS[c.status].label}</Badge>
    ),
    sortValue: (c) => STATUS[c.status].label,
    filter: { label: "סטטוס", value: (c) => STATUS[c.status].label },
  },
  {
    key: "actions",
    header: "פעולות",
    align: "end",
    cell: (c) => <ClubStatusToggle clubId={c.id} status={c.status} />,
  },
];

export function ClubList({ clubs }: { clubs: Club[] }) {
  return (
    <DataTable
      columns={columns}
      rows={clubs}
      rowKey={(c) => c.id}
      searchAccessor={(c) => `${c.name} ${c.slug}`}
      searchPlaceholder="חיפוש מועדון…"
      emptyMessage="עדיין אין מועדונים."
    />
  );
}
