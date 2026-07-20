"use client";

import { useRouter } from "next/navigation";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import type { Team } from "./types";

const columns: DataTableColumn<Team>[] = [
  {
    key: "name",
    header: "קבוצה",
    cell: (t) => (
      <span className="text-text-primary font-medium">{t.name}</span>
    ),
    sortValue: (t) => t.name,
  },
  {
    key: "age",
    header: "קטגוריית גיל",
    cell: (t) => (
      <span className="text-text-muted">{t.age_category ?? "—"}</span>
    ),
    sortValue: (t) => t.age_category ?? "",
    filter: { label: "קטגוריה", value: (t) => t.age_category ?? "" },
  },
];

/** רשימת קבוצות — לחיצה על שורה פותחת את עמוד הסגל (/teams/[id]). */
export function TeamList({ teams }: { teams: Team[] }) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      rows={teams}
      rowKey={(t) => t.id}
      onRowClick={(t) => router.push(`/teams/${t.id}`)}
      searchPlaceholder="חיפוש קבוצה…"
      emptyMessage="אין קבוצות בעונה זו."
    />
  );
}
