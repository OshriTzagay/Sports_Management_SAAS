"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPlayerAction, type CreatePlayerState } from "./actions";

const initialState: CreatePlayerState = { error: null };

export function CreatePlayerForm() {
  const [state, formAction, pending] = useActionState(
    createPlayerAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input name="firstName" placeholder="שם פרטי" required />
        <Input name="lastName" placeholder="שם משפחה" required />
      </div>
      <Input
        name="nationalId"
        placeholder="ת.ז. (אופציונלי)"
        inputMode="numeric"
      />
      <Input name="birthDate" type="date" aria-label="תאריך לידה" />
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "מוסיף…" : "שחקן חדש"}
      </Button>
    </form>
  );
}
