"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { RowModal } from "@/components/ui/row-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditContactForm } from "./edit-contact-form";
import type { Contact } from "./types";

function fullName(c: Contact): string {
  return [c.first_name, c.last_name].filter(Boolean).join(" ");
}

export function ContactList({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Contact | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = (contact: Contact) => {
    setSelected(contact);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => dialogRef.current?.close(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      `${fullName(c)} ${c.phone ?? ""} ${c.email ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [contacts, query]);

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="חיפוש לפי שם / טלפון / מייל…"
        className="max-w-xs"
      />

      {contacts.length === 0 ? (
        <p className="text-text-muted text-sm">עדיין אין אנשי קשר.</p>
      ) : filtered.length === 0 ? (
        <p className="text-text-muted text-sm">לא נמצאו תוצאות.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>שם</TableHead>
              <TableHead>טלפון</TableHead>
              <TableHead>אימייל</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((contact) => (
              <TableRow
                key={contact.id}
                onClick={() => open(contact)}
                className="cursor-pointer"
              >
                <TableCell className="text-text-primary font-medium">
                  {fullName(contact)}
                </TableCell>
                <TableCell className="text-text-muted">
                  {contact.phone ?? "—"}
                </TableCell>
                <TableCell className="text-text-muted">
                  {contact.email ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <RowModal dialogRef={dialogRef} title="עריכת איש קשר" onClose={close}>
        {selected && (
          <EditContactForm
            key={selected.id}
            contact={selected}
            onClose={close}
          />
        )}
      </RowModal>
    </div>
  );
}
