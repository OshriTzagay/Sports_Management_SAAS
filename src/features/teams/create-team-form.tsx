"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDialogClose } from "@/components/ui/form-dialog";
import { createTeamAction, type CreateTeamState } from "./actions";

const initialState: CreateTeamState = { error: null };

export function CreateTeamForm({ seasonId }: { seasonId: string }) {
  const close = useDialogClose();
  const [state, formAction, pending] = useActionState(
    createTeamAction,
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
      <input type="hidden" name="seasonId" value={seasonId} />
      <Input name="name" placeholder="שם הקבוצה — למשל נוער ב'" required />
      <Input name="ageCategory" placeholder="קטגוריית גיל (אופציונלי)" />
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : "קבוצה חדשה"}
      </Button>
    </form>
  );
}
