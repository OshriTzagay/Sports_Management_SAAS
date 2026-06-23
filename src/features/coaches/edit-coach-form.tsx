"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDialogClose } from "@/components/ui/form-dialog";
import { updateCoachAction, type CreateCoachState } from "./actions";
import type { Coach } from "./types";

const initialState: CreateCoachState = { error: null };

export function EditCoachForm({ coach }: { coach: Coach }) {
  const close = useDialogClose();
  const [state, formAction, pending] = useActionState(
    updateCoachAction,
    initialState,
  );
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) close();
    wasPending.current = pending;
  }, [pending, state.error, close]);

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
      <label className="text-text-muted text-xs">
        תוקף רישיון אימון
        <Input
          name="licenseExpiry"
          type="date"
          className="mt-1"
          defaultValue={coach.license_expiry ?? ""}
        />
      </label>
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : "שמירה"}
      </Button>
    </form>
  );
}
