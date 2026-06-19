"use client";

import { useRef } from "react";

import { setPlayerStatusAction } from "./actions";
import { PLAYER_STATUS_LABELS, type PlayerStatus } from "./types";

const STATUSES = Object.keys(PLAYER_STATUS_LABELS) as PlayerStatus[];

export function PlayerStatusControl({
  playerId,
  status,
}: {
  playerId: string;
  status: PlayerStatus;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={setPlayerStatusAction}>
      <input type="hidden" name="playerId" value={playerId} />
      <select
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className="border-border bg-bg-surface text-text-primary rounded-md border px-2 py-1 text-sm"
        aria-label="סטטוס שחקן"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {PLAYER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </form>
  );
}
