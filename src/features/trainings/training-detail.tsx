"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  endTrainingAction,
  setAttendanceAction,
  startTrainingAction,
} from "./actions";
import type { AttendanceRow, TrainingSession } from "./types";

function formatDuration(startedAt: string, endedAt: string): string {
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const mins = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h} שע' ${m} דק'` : `${m} דק'`;
}

export function TrainingDetail({
  session,
  attendance,
  canManage,
}: {
  session: TrainingSession;
  attendance: AttendanceRow[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState(attendance);
  const [error, setError] = useState<string | null>(null);
  const notesRef = useRef<HTMLDialogElement>(null);

  const present = rows.filter((r) => r.status === "present").length;
  const total = rows.length;

  function run(
    action: (fd: FormData) => Promise<void>,
    fields: Record<string, string>,
  ) {
    const formData = new FormData();
    for (const [k, v] of Object.entries(fields)) formData.set(k, v);
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "שגיאה");
      }
    });
  }

  function toggle(playerId: string, current: AttendanceRow["status"]) {
    if (!canManage || pending) return;
    const next = current === "present" ? "absent" : "present";
    setRows((rs) =>
      rs.map((r) => (r.player_id === playerId ? { ...r, status: next } : r)),
    );
    const formData = new FormData();
    formData.set("sessionId", session.id);
    formData.set("playerId", playerId);
    formData.set("status", next);
    startTransition(async () => {
      try {
        await setAttendanceAction(formData);
      } catch (err) {
        setRows((rs) =>
          rs.map((r) =>
            r.player_id === playerId ? { ...r, status: current } : r,
          ),
        );
        setError(err instanceof Error ? err.message : "שגיאה בשמירת נוכחות");
      }
    });
  }

  function submitEnd(formData: FormData) {
    formData.set("sessionId", session.id);
    setError(null);
    startTransition(async () => {
      try {
        await endTrainingAction(formData);
        notesRef.current?.close();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "שגיאה");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-danger text-sm">{error}</p>}

      {session.status === "scheduled" && (
        <div className="border-border bg-bg-surface flex flex-col items-center gap-4 rounded-lg border p-8 text-center">
          <p className="text-text-muted text-sm">האימון מתוזמן ומוכן להתחלה.</p>
          {canManage ? (
            <Button
              type="button"
              disabled={pending}
              className="h-12 w-full max-w-xs text-base"
              onClick={() =>
                run(startTrainingAction, { sessionId: session.id })
              }
            >
              {pending ? <Spinner className="size-5" /> : "התחלת אימון"}
            </Button>
          ) : (
            <p className="text-text-muted text-xs">
              אין לך הרשאה לנהל אימון זה.
            </p>
          )}
        </div>
      )}

      {session.status === "in_progress" && (
        <>
          <AttendanceHeader present={present} total={total} />
          <ul className="flex flex-col gap-2 pb-24">
            {rows.map((r) => {
              const isPresent = r.status === "present";
              return (
                <li key={r.player_id}>
                  <button
                    type="button"
                    disabled={!canManage || pending}
                    onClick={() => toggle(r.player_id, r.status)}
                    className={cn(
                      "border-border flex h-14 w-full items-center justify-between gap-3 rounded-lg border px-4 transition-colors",
                      isPresent
                        ? "bg-success-bg border-success/30"
                        : "bg-bg-surface",
                    )}
                  >
                    <span className="text-text-primary font-medium">
                      {r.first_name} {r.last_name}
                    </span>
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full",
                        isPresent
                          ? "bg-success text-white"
                          : "bg-bg-muted text-text-muted",
                      )}
                    >
                      {isPresent ? (
                        <Check className="size-5" />
                      ) : (
                        <X className="size-5" />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {canManage && (
            <div className="border-border bg-bg fixed inset-x-0 bottom-0 border-t p-4">
              <div className="mx-auto max-w-2xl">
                <Button
                  type="button"
                  disabled={pending}
                  className="h-12 w-full text-base"
                  onClick={() => notesRef.current?.showModal()}
                >
                  סיום אימון
                </Button>
              </div>
            </div>
          )}

          <dialog
            ref={notesRef}
            onClick={(e) => {
              if (e.target === notesRef.current) notesRef.current?.close();
            }}
            className="border-border bg-bg-surface text-text-body m-auto w-[min(92vw,28rem)] rounded-lg border p-6 shadow-lg backdrop:bg-black/40"
          >
            <form action={submitEnd} className="flex flex-col gap-3">
              <h2 className="text-text-primary text-lg font-bold">
                סיום אימון
              </h2>
              <p className="text-text-muted text-sm">
                נוכחות: {present} מתוך {total}. ניתן להוסיף הערה או אירוע חריג
                (אופציונלי).
              </p>
              <textarea
                name="notes"
                rows={3}
                placeholder="הערות / אירוע חריג…"
                className="border-border bg-bg-surface text-text-primary focus-visible:border-primary-300 rounded-md border px-3 py-2 text-sm outline-none"
              />
              <div className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => notesRef.current?.close()}
                >
                  חזרה
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? <Spinner className="size-4" /> : "סיום ונעילה"}
                </Button>
              </div>
            </form>
          </dialog>
        </>
      )}

      {session.status === "completed" && (
        <div className="flex flex-col gap-4">
          <AttendanceHeader present={present} total={total} />
          <div className="border-border bg-bg-surface flex flex-col gap-2 rounded-lg border p-4 text-sm">
            {session.started_at && session.ended_at && (
              <Row
                label="משך"
                value={formatDuration(session.started_at, session.ended_at)}
              />
            )}
            {session.notes && <Row label="הערות" value={session.notes} />}
            {!session.notes && (
              <span className="text-text-muted text-xs">אין הערות.</span>
            )}
          </div>
          <ul className="flex flex-col gap-2">
            {rows.map((r) => (
              <li
                key={r.player_id}
                className="border-border bg-bg-surface flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
              >
                <span className="text-text-primary">
                  {r.first_name} {r.last_name}
                </span>
                <span
                  className={
                    r.status === "present"
                      ? "text-success-text"
                      : "text-text-muted"
                  }
                >
                  {r.status === "present" ? "הגיע" : "לא הגיע"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {session.status === "cancelled" && (
        <p className="text-text-muted text-sm">האימון בוטל.</p>
      )}
    </div>
  );
}

function AttendanceHeader({
  present,
  total,
}: {
  present: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  return (
    <div className="border-border bg-bg-surface flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-text-muted text-sm">נוכחות</span>
        <span className="text-text-primary text-2xl font-bold">
          {present}
          <span className="text-text-muted text-base"> / {total}</span>
        </span>
      </div>
      <div className="bg-bg-muted h-2 overflow-hidden rounded-full">
        <div
          className="bg-success h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-primary text-end">{value}</span>
    </div>
  );
}
