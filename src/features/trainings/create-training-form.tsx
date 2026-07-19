"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Spinner } from "@/components/ui/spinner";
import { useDialogClose } from "@/components/ui/form-dialog";
import { createTrainingAction, type CreateTrainingState } from "./actions";
import type { CoachTeam } from "./types";

const initialState: CreateTrainingState = { error: null };

/** מועד ברירת מחדל = עכשיו, בפורמט של datetime-local. */
function nowLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function CreateTrainingForm({
  teams,
  seasonId,
}: {
  teams: CoachTeam[];
  seasonId: string;
}) {
  const [state, formAction, pending] = useActionState(
    createTrainingAction,
    initialState,
  );
  const [teamId, setTeamId] = useState(
    teams.length === 1 ? (teams[0]?.team_id ?? "") : "",
  );
  const close = useDialogClose();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) close();
    wasPending.current = pending;
  }, [pending, state.error, close]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="seasonId" value={seasonId} />
      <label className="text-text-muted flex flex-col gap-1 text-xs">
        קבוצה
        <SearchableSelect
          name="teamId"
          value={teamId}
          onChange={setTeamId}
          options={teams.map((t) => ({ value: t.team_id, label: t.team_name }))}
          placeholder="בחירת קבוצה…"
          searchPlaceholder="חיפוש קבוצה…"
        />
      </label>
      <label className="text-text-muted flex flex-col gap-1 text-xs">
        מועד
        <Input
          name="scheduledAt"
          type="datetime-local"
          defaultValue={nowLocal()}
          required
        />
      </label>
      <Input name="title" placeholder="כותרת / מוקד האימון (אופציונלי)" />
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending || !teamId}>
        {pending ? <Spinner className="size-4" /> : "יצירת אימון"}
      </Button>
    </form>
  );
}
