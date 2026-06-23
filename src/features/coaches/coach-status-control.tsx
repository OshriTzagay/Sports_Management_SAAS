"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [value, setValue] = useState<CoachStatus>(status);
  const [pending, startTransition] = useTransition();

  function handleChange(next: CoachStatus) {
    setValue(next);
    const formData = new FormData();
    formData.set("coachId", coachId);
    formData.set("status", next);
    startTransition(async () => {
      await setCoachStatusAction(formData);
      router.refresh();
    });
  }

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value as CoachStatus)}
      aria-label="סטטוס מאמן"
      className="border-border bg-bg-surface text-text-primary rounded-md border px-2 py-1 text-sm disabled:opacity-60"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {COACH_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
