"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  deleteTeamAction,
  updateTeamAction,
  type CreateTeamState,
} from "./actions";
import type { Team } from "./types";

const initialState: CreateTeamState = { error: null };

export function EditTeamForm({
  team,
  onClose,
}: {
  team: Team;
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateTeamAction,
    initialState,
  );
  const [deleting, startDelete] = useTransition();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) onClose();
    wasPending.current = pending;
  }, [pending, state.error, onClose]);

  function handleDelete() {
    const formData = new FormData();
    formData.set("teamId", team.id);
    startDelete(async () => {
      await deleteTeamAction(formData);
      router.refresh();
      onClose();
    });
  }

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
      <div className="flex items-center justify-between">
        <Button type="submit" disabled={pending || deleting}>
          {pending ? <Spinner className="size-4" /> : "שמירה"}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={pending || deleting}
          onClick={handleDelete}
        >
          {deleting ? <Spinner className="size-4" /> : "מחיקה"}
        </Button>
      </div>
    </form>
  );
}
