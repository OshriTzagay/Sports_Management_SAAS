import { AlertTriangle } from "lucide-react";

import { ABSENCE_ALERT_THRESHOLD, type PlayerAttendance } from "./types";

/** סיכום נוכחות פר-שחקן. מדגיש שחקנים שהחסירו מעל הסף (התראת היעדרות). */
export function AttendanceSummary({ rows }: { rows: PlayerAttendance[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-text-muted text-sm">
        אין עדיין נתוני נוכחות בעונה זו.
      </p>
    );
  }

  const atRisk = rows.filter((r) => r.absent > ABSENCE_ALERT_THRESHOLD);

  return (
    <div className="flex flex-col gap-3">
      {atRisk.length > 0 && (
        <div className="bg-warning-bg text-warning-text flex items-start gap-2 rounded-lg px-3 py-2 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            {atRisk.length} שחקנים החסירו מעל {ABSENCE_ALERT_THRESHOLD} אימונים:{" "}
            {atRisk.map((r) => r.name).join(", ")}.
          </span>
        </div>
      )}
      <ul className="flex flex-col gap-1">
        {rows.map((r) => {
          const alert = r.absent > ABSENCE_ALERT_THRESHOLD;
          return (
            <li
              key={r.player_id}
              className="border-border flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
            >
              <span className="text-text-primary flex items-center gap-1.5 font-medium">
                {alert && <AlertTriangle className="text-warning size-4" />}
                {r.name}
              </span>
              <span className="text-text-muted">
                <span className="text-text-primary font-medium">
                  {r.present}
                </span>
                /{r.total} נוכחות
                {r.absent > 0 && (
                  <span className={alert ? "text-danger ms-2" : "ms-2"}>
                    · {r.absent} היעדרויות
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
