"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSeasonAction, type CreateSeasonState } from "./actions";

const initialState: CreateSeasonState = { error: null };

export function CreateSeasonForm() {
  const [state, formAction, pending] = useActionState(
    createSeasonAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Input name="name" placeholder="שם העונה — למשל 2026/27" required />
      <div className="flex gap-2">
        <Input name="startsOn" type="date" aria-label="תאריך התחלה" />
        <Input name="endsOn" type="date" aria-label="תאריך סיום" />
      </div>
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "יוצר…" : "עונה חדשה"}
      </Button>
    </form>
  );
}
