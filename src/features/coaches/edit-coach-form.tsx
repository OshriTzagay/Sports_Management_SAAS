"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { updateCoachAction, type CreateCoachState } from "./actions";
import { COACH_STATUS_LABELS, type Coach, type CoachStatus } from "./types";

const initialState: CreateCoachState = { error: null };
const STATUSES = Object.keys(COACH_STATUS_LABELS) as CoachStatus[];

export function EditCoachForm({
  coach,
  onClose,
}: {
  coach: Coach;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateCoachAction,
    initialState,
  );
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) onClose();
    wasPending.current = pending;
  }, [pending, state.error, onClose]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="coachId" value={coach.id} />
      <div className="flex gap-2">
        <Input name="firstName" defaultValue={coach.first_name} required />
        <Input name="lastName" defaultValue={coach.last_name} required />
      </div>
      <Input
        name="phone"
        placeholder="טלפון"
        defaultValue={coach.phone ?? ""}
        inputMode="tel"
      />
      <Input
        name="certification"
        placeholder="הסמכה / תעודה"
        defaultValue={coach.certification ?? ""}
      />
      <label className="text-text-muted flex flex-col gap-1 text-xs">
        תוקף רישיון אימון
        <Input
          name="licenseExpiry"
          type="date"
          defaultValue={coach.license_expiry ?? ""}
        />
      </label>
      <label className="text-text-muted flex flex-col gap-1 text-xs">
        סטטוס
        <select
          name="status"
          defaultValue={coach.status}
          className="border-border bg-bg-surface text-text-primary h-10 w-full rounded-md border px-3 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {COACH_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : "שמירה"}
      </Button>
    </form>
  );
}
