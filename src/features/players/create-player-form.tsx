"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDialogClose } from "@/components/ui/form-dialog";
import { createPlayerAction, type CreatePlayerState } from "./actions";

const initialState: CreatePlayerState = { error: null };

export function CreatePlayerForm() {
  const close = useDialogClose();
  const [state, formAction, pending] = useActionState(
    createPlayerAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      formRef.current?.reset();
      close();
    }
    wasPending.current = pending;
  }, [pending, state.error, close]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
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
        {pending ? <Spinner className="size-4" /> : "שחקן חדש"}
      </Button>
    </form>
  );
}
