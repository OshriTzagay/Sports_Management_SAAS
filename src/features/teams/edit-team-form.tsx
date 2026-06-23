"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDialogClose } from "@/components/ui/form-dialog";
import { updateTeamAction, type CreateTeamState } from "./actions";
import type { Team } from "./types";

const initialState: CreateTeamState = { error: null };

export function EditTeamForm({ team }: { team: Team }) {
  const close = useDialogClose();
  const [state, formAction, pending] = useActionState(
    updateTeamAction,
    initialState,
  );
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) close();
    wasPending.current = pending;
  }, [pending, state.error, close]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="teamId" value={team.id} />
      <Input name="name" defaultValue={team.name} required />
      <Input
        name="ageCategory"
        placeholder="קטגוריית גיל"
        defaultValue={team.age_category ?? ""}
      />
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : "שמירה"}
      </Button>
    </form>
  );
}
