"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { updateSeasonAction, type CreateSeasonState } from "./actions";
import type { Season } from "./types";

const initialState: CreateSeasonState = { error: null };

export function EditSeasonForm({
  season,
  onClose,
}: {
  season: Season;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateSeasonAction,
    initialState,
  );
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) onClose();
    wasPending.current = pending;
  }, [pending, state.error, onClose]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="seasonId" value={season.id} />
      <Input name="name" defaultValue={season.name} required />
      <div className="flex gap-2">
        <Input
          name="startsOn"
          type="date"
          aria-label="תאריך התחלה"
          defaultValue={season.starts_on ?? ""}
        />
        <Input
          name="endsOn"
          type="date"
          aria-label="תאריך סיום"
          defaultValue={season.ends_on ?? ""}
        />
      </div>
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : "שמירה"}
      </Button>
    </form>
  );
}
