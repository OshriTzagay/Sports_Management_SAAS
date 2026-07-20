"use client";

import { useCallback, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { RowModal } from "@/components/ui/row-modal";
import { ChargeActionsPanel } from "./charge-actions-panel";
import {
  CHARGE_STATUS_LABELS,
  formatAgorot,
  type Charge,
  type ChargeStatus,
} from "./types";

const STATUS_VARIANT: Record<
  ChargeStatus,
  "success" | "muted" | "danger" | "info"
> = {
  pending: "muted",
  partially_paid: "info",
  paid: "success",
  waived: "info",
  failed: "danger",
  refunded: "muted",
  cancelled: "muted",
};

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString("he-IL") : "—";
}

export function ChargeList({
  charges,
  canManage,
}: {
  charges: Charge[];
  canManage: boolean;
}) {
  const [selected, setSelected] = useState<Charge | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = (charge: Charge) => {
    setSelected(charge);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => dialogRef.current?.close(), []);

  const columns: DataTableColumn<Charge>[] = [
    {
      key: "player",
      header: "שחקן",
      cell: (c) => (
        <span className="text-text-primary font-medium">{c.player_name}</span>
      ),
      sortValue: (c) => c.player_name,
    },
    {
      key: "description",
      header: "תיאור",
      cell: (c) => <span className="text-text-muted">{c.description}</span>,
      sortValue: (c) => c.description,
    },
    {
      key: "amount",
      header: "סכום",
      cell: (c) => (
        <span className="text-text-primary">
          {formatAgorot(c.amount_agorot, c.currency)}
          {c.discount_agorot > 0 && (
            <span className="text-success-text ms-1 text-xs">(הנחה)</span>
          )}
        </span>
      ),
      sortValue: (c) => c.amount_agorot,
    },
    {
      key: "paid",
      header: "שולם",
      cell: (c) => (
        <span className="text-text-muted">
          {formatAgorot(c.paid_agorot, c.currency)}
        </span>
      ),
      sortValue: (c) => c.paid_agorot,
    },
    {
      key: "due",
      header: "תאריך יעד",
      cell: (c) => (
        <span className="text-text-muted">{formatDate(c.due_date)}</span>
      ),
      sortValue: (c) => c.due_date ?? "",
    },
    {
      key: "status",
      header: "סטטוס",
      align: "end",
      cell: (c) => (
        <Badge variant={STATUS_VARIANT[c.status]}>
          {CHARGE_STATUS_LABELS[c.status]}
        </Badge>
      ),
      sortValue: (c) => CHARGE_STATUS_LABELS[c.status],
      filter: {
        label: "סטטוס",
        value: (c) => CHARGE_STATUS_LABELS[c.status],
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={charges}
        rowKey={(c) => c.id}
        onRowClick={open}
        searchAccessor={(c) => `${c.player_name} ${c.description}`}
        searchPlaceholder="חיפוש לפי שחקן / תיאור…"
        emptyMessage="עדיין אין חיובים."
      />

      <RowModal dialogRef={dialogRef} title="פרטי חיוב" onClose={close}>
        {selected && (
          <ChargeActionsPanel
            key={selected.id}
            charge={selected}
            canManage={canManage}
            onDone={close}
          />
        )}
      </RowModal>
    </>
  );
}
