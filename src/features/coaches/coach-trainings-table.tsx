"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  TRAINING_STATUS_LABELS,
  type TrainingSession,
  type TrainingStatus,
} from "@/features/trainings/types";

const STATUS_VARIANT: Record<
  TrainingStatus,
  "info" | "success" | "muted" | "danger"
> = {
  scheduled: "info",
  in_progress: "success",
  completed: "muted",
  cancelled: "danger",
};

function durationMinutes(t: TrainingSession): number {
  if (!t.started_at || !t.ended_at) return 0;
  const ms = new Date(t.ended_at).getTime() - new Date(t.started_at).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

function formatHours(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} דק'`;
  return m === 0 ? `${h} שע'` : `${h}:${String(m).padStart(2, "0")} שע'`;
}

const columns: DataTableColumn<TrainingSession>[] = [
  {
    key: "date",
    header: "תאריך",
    cell: (t) => (
      <span className="text-text-primary font-medium">
        {new Date(t.scheduled_at).toLocaleDateString("he-IL")}
      </span>
    ),
    sortValue: (t) => t.scheduled_at,
  },
  {
    key: "team",
    header: "קבוצה",
    cell: (t) => <span className="text-text-muted">{t.team_name ?? "—"}</span>,
    sortValue: (t) => t.team_name ?? "",
    filter: { label: "קבוצה", value: (t) => t.team_name ?? "" },
  },
  {
    key: "attendance",
    header: "נוכחות",
    cell: (t) => (
      <span className="text-text-muted">
        {t.present_count}/{t.roster_count}
      </span>
    ),
    sortValue: (t) => t.present_count,
  },
  {
    key: "duration",
    header: "משך",
    cell: (t) => (
      <span className="text-text-muted">
        {t.status === "completed" ? formatHours(durationMinutes(t)) : "—"}
      </span>
    ),
    sortValue: (t) => durationMinutes(t),
  },
  {
    key: "status",
    header: "סטטוס",
    align: "end",
    cell: (t) => (
      <Badge variant={STATUS_VARIANT[t.status]}>
        {TRAINING_STATUS_LABELS[t.status]}
      </Badge>
    ),
    sortValue: (t) => TRAINING_STATUS_LABELS[t.status],
    filter: { label: "סטטוס", value: (t) => TRAINING_STATUS_LABELS[t.status] },
  },
];

export function CoachTrainingsTable({
  trainings,
}: {
  trainings: TrainingSession[];
}) {
  const completed = trainings.filter((t) => t.status === "completed");
  const totalMinutes = completed.reduce(
    (sum, t) => sum + durationMinutes(t),
    0,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Metric label="סה״כ אימונים" value={String(trainings.length)} />
        <Metric label="הושלמו" value={String(completed.length)} />
        <Metric label="סה״כ שעות" value={formatHours(totalMinutes)} />
      </div>

      <DataTable
        columns={columns}
        rows={trainings}
        rowKey={(t) => t.id}
        searchAccessor={(t) =>
          `${t.team_name ?? ""} ${TRAINING_STATUS_LABELS[t.status]}`
        }
        searchPlaceholder="חיפוש לפי קבוצה / סטטוס…"
        emptyMessage="אין אימונים למאמן זה בעונה."
        maxHeight="60vh"
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-muted flex flex-col gap-0.5 rounded-lg p-3">
      <span className="text-text-muted text-xs">{label}</span>
      <span className="text-text-primary text-xl font-bold">{value}</span>
    </div>
  );
}
