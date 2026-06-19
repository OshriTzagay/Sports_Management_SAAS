"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCoachAction, type CreateCoachState } from "./actions";

const initialState: CreateCoachState = { error: null };

export function CreateCoachForm() {
  const [state, formAction, pending] = useActionState(
    createCoachAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input name="firstName" placeholder="שם פרטי" required />
        <Input name="lastName" placeholder="שם משפחה" required />
      </div>
      <Input name="phone" placeholder="טלפון (אופציונלי)" inputMode="tel" />
      <Input name="certification" placeholder="הסמכה / תעודה (אופציונלי)" />
      <label className="text-text-muted text-xs">
        תוקף רישיון אימון
        <Input name="licenseExpiry" type="date" className="mt-1" />
      </label>
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "מוסיף…" : "מאמן חדש"}
      </Button>
    </form>
  );
}
