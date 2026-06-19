"use client";

import { useRef } from "react";

import { setCoachStatusAction } from "./actions";
import { COACH_STATUS_LABELS, type CoachStatus } from "./types";

const STATUSES = Object.keys(COACH_STATUS_LABELS) as CoachStatus[];

export function CoachStatusControl({
  coachId,
  status,
}: {
  coachId: string;
  status: CoachStatus;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={setCoachStatusAction}>
      <input type="hidden" name="coachId" value={coachId} />
      <select
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className="border-border bg-bg-surface text-text-primary rounded-md border px-2 py-1 text-sm"
        aria-label="סטטוס מאמן"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {COACH_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </form>
  );
}
