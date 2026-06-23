"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [value, setValue] = useState(currentTeamId ?? "");
  const [pending, startTransition] = useTransition();

  function handleChange(teamId: string) {
    setValue(teamId); // אופטימי — לא חוזר ל"ללא"
    const formData = new FormData();
    formData.set("playerId", playerId);
    formData.set("seasonId", seasonId);
    formData.set("teamId", teamId);
    startTransition(async () => {
      await assignPlayerToTeamAction(formData);
      router.refresh();
    });
  }

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="שיבוץ לקבוצה"
      className="border-border bg-bg-surface text-text-primary rounded-md border px-2 py-1 text-sm disabled:opacity-60"
    >
      <option value="">— ללא —</option>
      {teams.map((team) => (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      ))}
    </select>
  );
}
