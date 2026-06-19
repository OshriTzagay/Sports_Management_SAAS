"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSeasonAction, type CreateSeasonState } from "./actions";
import type { Season } from "./types";

const initialState: CreateSeasonState = { error: null };

export function CreateSeasonForm({ seasons }: { seasons: Season[] }) {
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
      {seasons.length > 0 && (
        <label className="text-text-muted text-xs">
          העתקת מבנה מעונה (גלגול — אופציונלי)
          <select
            name="rolloverFromId"
            defaultValue=""
            className="border-border bg-bg-surface text-text-primary mt-1 h-10 w-full rounded-md border px-3 text-sm"
          >
            <option value="">— ללא —</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "יוצר…" : "עונה חדשה"}
      </Button>
    </form>
  );
}
