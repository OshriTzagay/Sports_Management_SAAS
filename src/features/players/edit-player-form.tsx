"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Spinner } from "@/components/ui/spinner";
import type { Team } from "@/features/teams";
import { updatePlayerAction, type CreatePlayerState } from "./actions";
import { PLAYER_STATUS_LABELS, type Player, type PlayerStatus } from "./types";

const initialState: CreatePlayerState = { error: null };
const STATUSES = Object.keys(PLAYER_STATUS_LABELS) as PlayerStatus[];

const selectClass =
  "h-10 w-full rounded-md border border-border bg-bg-surface px-3 text-sm text-text-primary";

export function EditPlayerForm({
  player,
  seasonId,
  teams,
  currentTeamId,
  onClose,
}: {
  player: Player;
  seasonId: string | null;
  teams: Team[];
  currentTeamId: string | null;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    updatePlayerAction,
    initialState,
  );
  const [teamId, setTeamId] = useState(currentTeamId ?? "");
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) onClose();
    wasPending.current = pending;
  }, [pending, state.error, onClose]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="playerId" value={player.id} />
      {seasonId && <input type="hidden" name="seasonId" value={seasonId} />}

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

      <label className="text-text-muted flex flex-col gap-1 text-xs">
        סטטוס
        <select
          name="status"
          defaultValue={player.status}
          className={selectClass}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {PLAYER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

      {seasonId && (
        <label className="text-text-muted flex flex-col gap-1 text-xs">
          קבוצה (בעונה הפעילה)
          <SearchableSelect
            name="teamId"
            value={teamId}
            onChange={setTeamId}
            options={teams.map((team) => ({
              value: team.id,
              label: team.name,
            }))}
            emptyLabel="— ללא —"
            placeholder="בחירת קבוצה…"
            searchPlaceholder="חיפוש קבוצה…"
          />
        </label>
      )}

      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : "שמירה"}
      </Button>
    </form>
  );
}
