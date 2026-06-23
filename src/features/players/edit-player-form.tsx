"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDialogClose } from "@/components/ui/form-dialog";
import { updatePlayerAction, type CreatePlayerState } from "./actions";
import type { Player } from "./types";

const initialState: CreatePlayerState = { error: null };

export function EditPlayerForm({ player }: { player: Player }) {
  const close = useDialogClose();
  const [state, formAction, pending] = useActionState(
    updatePlayerAction,
    initialState,
  );
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) close();
    wasPending.current = pending;
  }, [pending, state.error, close]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="playerId" value={player.id} />
      <div className="flex gap-2">
        <Input name="firstName" defaultValue={player.first_name} required />
        <Input name="lastName" defaultValue={player.last_name} required />
      </div>
      <Input
        name="nationalId"
        placeholder="ת.ז."
        defaultValue={player.national_id ?? ""}
        inputMode="numeric"
      />
      <Input
        name="birthDate"
        type="date"
        aria-label="תאריך לידה"
        defaultValue={player.birth_date ?? ""}
      />
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : "שמירה"}
      </Button>
    </form>
  );
}
