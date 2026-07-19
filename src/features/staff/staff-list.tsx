"use client";

import { useCallback, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { RowModal } from "@/components/ui/row-modal";
import { StaffEditor } from "./staff-editor";
import type { AssignableRole, StaffUser } from "./types";

const STATUS_LABEL = { active: "פעיל", inactive: "מושבת" } as const;

export function StaffList({
  staff,
  roles,
  currentUserId,
}: {
  staff: StaffUser[];
  roles: AssignableRole[];
  currentUserId: string;
}) {
  const [selected, setSelected] = useState<StaffUser | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = (s: StaffUser) => {
    setSelected(s);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => dialogRef.current?.close(), []);

  const columns: DataTableColumn<StaffUser>[] = [
    {
      key: "name",
      header: "שם",
      cell: (s) => (
        <span className="text-text-primary font-medium">
          {s.full_name ?? "—"}
          {s.id === currentUserId && (
            <span className="text-text-muted"> (אתה)</span>
          )}
        </span>
      ),
      sortValue: (s) => s.full_name ?? "",
    },
    {
      key: "email",
      header: "אימייל",
      cell: (s) => <span className="text-text-muted">{s.email}</span>,
      sortValue: (s) => s.email,
    },
    {
      key: "role",
      header: "תפקיד",
      cell: (s) => (
        <span className="text-text-muted">{s.role_name ?? "—"}</span>
      ),
      sortValue: (s) => s.role_name ?? "",
      filter: { label: "תפקיד", value: (s) => s.role_name ?? "" },
    },
    {
      key: "status",
      header: "סטטוס",
      align: "end",
      cell: (s) => (
        <Badge variant={s.status === "active" ? "success" : "muted"}>
          {STATUS_LABEL[s.status]}
        </Badge>
      ),
      sortValue: (s) => STATUS_LABEL[s.status],
      filter: { label: "סטטוס", value: (s) => STATUS_LABEL[s.status] },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={staff}
        rowKey={(s) => s.id}
        onRowClick={open}
        searchAccessor={(s) =>
          `${s.full_name ?? ""} ${s.email} ${s.role_name ?? ""}`
        }
        searchPlaceholder="חיפוש לפי שם / אימייל…"
        emptyMessage="עדיין אין משתמשי צוות."
      />

      <RowModal dialogRef={dialogRef} title="ניהול משתמש" onClose={close}>
        {selected && (
          <StaffEditor
            key={selected.id}
            staff={selected}
            roles={roles}
            isSelf={selected.id === currentUserId}
            onDone={close}
          />
        )}
      </RowModal>
    </>
  );
}
