"use client";

import { useRef } from "react";

import type { Team } from "@/features/teams";
import { assignPlayerToTeamAction } from "./actions";

export function TeamAssignmentControl({
  playerId,
  seasonId,
  currentTeamId,
  teams,
}: {
  playerId: string;
  seasonId: string;
  currentTeamId: string | null;
  teams: Team[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={assignPlayerToTeamAction}>
      <input type="hidden" name="playerId" value={playerId} />
      <input type="hidden" name="seasonId" value={seasonId} />
      <select
        name="teamId"
        defaultValue={currentTeamId ?? ""}
        onChange={() => formRef.current?.requestSubmit()}
        className="border-border bg-bg-surface text-text-primary rounded-md border px-2 py-1 text-sm"
        aria-label="שיבוץ לקבוצה"
      >
        <option value="">— ללא —</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </form>
  );
}
