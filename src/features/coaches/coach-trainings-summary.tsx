"use client";

import {
  TRAINING_STATUS_LABELS,
  type TrainingSession,
} from "@/features/trainings/types";

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("he-IL");
}

/** סיכום אימוני מאמן לעונה — לתשלום. ספירת אימונים שהושלמו + סה"כ שעות + פירוט. */
export function CoachTrainingsSummary({
  trainings,
}: {
  trainings: TrainingSession[];
}) {
  const completed = trainings.filter((t) => t.status === "completed");
  const totalMinutes = completed.reduce(
    (sum, t) => sum + durationMinutes(t),
    0,
  );

  if (trainings.length === 0) {
    return (
      <span className="text-text-muted text-xs">אין אימונים בעונה זו.</span>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-bg-muted flex flex-col gap-0.5 rounded-md p-3">
          <span className="text-text-muted text-xs">אימונים שהושלמו</span>
          <span className="text-text-primary text-xl font-bold">
            {completed.length}
          </span>
        </div>
        <div className="bg-bg-muted flex flex-col gap-0.5 rounded-md p-3">
          <span className="text-text-muted text-xs">סה״כ שעות</span>
          <span className="text-text-primary text-xl font-bold">
            {formatHours(totalMinutes)}
          </span>
        </div>
      </div>

      <ul className="flex max-h-56 flex-col gap-1 overflow-y-auto">
        {trainings.map((t) => (
          <li
            key={t.id}
            className="border-border flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-xs"
          >
            <div className="flex min-w-0 flex-col">
              <span className="text-text-primary truncate font-medium">
                {t.team_name ?? "—"}
              </span>
              <span className="text-text-muted">
                {formatDate(t.scheduled_at)}
                {t.status === "completed"
                  ? ` · ${formatHours(durationMinutes(t))}`
                  : ` · ${TRAINING_STATUS_LABELS[t.status]}`}
              </span>
            </div>
            <span className="text-text-muted shrink-0">
              {t.present_count}/{t.roster_count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
