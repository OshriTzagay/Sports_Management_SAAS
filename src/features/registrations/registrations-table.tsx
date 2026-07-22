"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { formatAgorot } from "@/features/payments/types";
import {
  REGISTRATION_STATUS_LABELS,
  type RegistrationRow,
  type RegistrationStatus,
} from "./types";

const STATUS_VARIANT: Record<
  RegistrationStatus,
  "success" | "muted" | "danger" | "info"
> = {
  pending: "muted",
  paid: "info",
  completed: "success",
  failed: "danger",
  cancelled: "muted",
  expired: "muted",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("he-IL");
}

const columns: DataTableColumn<RegistrationRow>[] = [
  {
    key: "player",
    header: "שחקן",
    cell: (r) => (
      <span className="text-text-primary font-medium">
        {r.player_first_name} {r.player_last_name}
      </span>
    ),
    sortValue: (r) => `${r.player_first_name} ${r.player_last_name}`,
  },
  {
    key: "payer",
    header: "משלם",
    cell: (r) => (
      <span className="text-text-muted">
        {r.contact_first_name} · {r.contact_phone}
      </span>
    ),
    sortValue: (r) => r.contact_first_name,
  },
  {
    key: "amount",
    header: "סכום",
    cell: (r) => (
      <span className="text-text-muted">
        {formatAgorot(r.amount_agorot, r.currency)}
      </span>
    ),
    sortValue: (r) => r.amount_agorot,
  },
  {
    key: "date",
    header: "תאריך",
    cell: (r) => (
      <span className="text-text-muted">{formatDate(r.created_at)}</span>
    ),
    sortValue: (r) => r.created_at,
  },
  {
    key: "status",
    header: "סטטוס",
    align: "end",
    cell: (r) => (
      <Badge variant={STATUS_VARIANT[r.status]}>
        {REGISTRATION_STATUS_LABELS[r.status]}
      </Badge>
    ),
    sortValue: (r) => REGISTRATION_STATUS_LABELS[r.status],
    filter: {
      label: "סטטוס",
      value: (r) => REGISTRATION_STATUS_LABELS[r.status],
    },
  },
];

export function RegistrationsTable({ rows }: { rows: RegistrationRow[] }) {
  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      searchAccessor={(r) =>
        `${r.player_first_name} ${r.player_last_name} ${r.contact_first_name} ${r.contact_phone}`
      }
      searchPlaceholder="חיפוש הרשמה…"
      emptyMessage="עדיין אין הרשמות."
    />
  );
}
