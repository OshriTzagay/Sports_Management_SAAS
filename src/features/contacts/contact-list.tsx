"use client";

import { useCallback, useRef, useState } from "react";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { RowModal } from "@/components/ui/row-modal";
import { EditContactForm } from "./edit-contact-form";
import type { Contact } from "./types";

function fullName(c: Contact): string {
  return [c.first_name, c.last_name].filter(Boolean).join(" ");
}

const columns: DataTableColumn<Contact>[] = [
  {
    key: "name",
    header: "שם",
    cell: (c) => (
      <span className="text-text-primary font-medium">{fullName(c)}</span>
    ),
    sortValue: (c) => fullName(c),
  },
  {
    key: "phone",
    header: "טלפון",
    cell: (c) => <span className="text-text-muted">{c.phone ?? "—"}</span>,
    sortValue: (c) => c.phone ?? "",
  },
  {
    key: "email",
    header: "אימייל",
    cell: (c) => <span className="text-text-muted">{c.email ?? "—"}</span>,
    sortValue: (c) => c.email ?? "",
  },
];

export function ContactList({
  contacts,
  readOnly = false,
}: {
  contacts: Contact[];
  readOnly?: boolean;
}) {
  const [selected, setSelected] = useState<Contact | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = (contact: Contact) => {
    if (readOnly) return;
    setSelected(contact);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => dialogRef.current?.close(), []);

  return (
    <>
      <DataTable
        columns={columns}
        rows={contacts}
        rowKey={(c) => c.id}
        onRowClick={readOnly ? undefined : open}
        searchAccessor={(c) =>
          `${c.first_name} ${c.last_name ?? ""} ${c.phone ?? ""} ${c.email ?? ""}`
        }
        searchPlaceholder="חיפוש לפי שם / טלפון / מייל…"
        emptyMessage="עדיין אין אנשי קשר."
      />

      {!readOnly && (
        <RowModal dialogRef={dialogRef} title="עריכת איש קשר" onClose={close}>
          {selected && (
            <EditContactForm
              key={selected.id}
              contact={selected}
              onClose={close}
            />
          )}
        </RowModal>
      )}
    </>
  );
}
