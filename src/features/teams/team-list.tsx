"use client";

import { useCallback, useRef, useState } from "react";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { RowModal } from "@/components/ui/row-modal";
import { EditTeamForm } from "./edit-team-form";
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

export function TeamList({
  teams,
  readOnly = false,
}: {
  teams: Team[];
  readOnly?: boolean;
}) {
  const [selected, setSelected] = useState<Team | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = (team: Team) => {
    if (readOnly) return;
    setSelected(team);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => dialogRef.current?.close(), []);

  return (
    <>
      <DataTable
        columns={columns}
        rows={teams}
        rowKey={(t) => t.id}
        onRowClick={readOnly ? undefined : open}
        searchPlaceholder="חיפוש קבוצה…"
        emptyMessage="אין קבוצות בעונה זו."
      />

      {!readOnly && (
        <RowModal dialogRef={dialogRef} title="עריכת קבוצה" onClose={close}>
          {selected && (
            <EditTeamForm key={selected.id} team={selected} onClose={close} />
          )}
        </RowModal>
      )}
    </>
  );
}
