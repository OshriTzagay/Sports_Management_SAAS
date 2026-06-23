"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [value, setValue] = useState<PlayerStatus>(status);
  const [pending, startTransition] = useTransition();

  function handleChange(next: PlayerStatus) {
    setValue(next);
    const formData = new FormData();
    formData.set("playerId", playerId);
    formData.set("status", next);
    startTransition(async () => {
      await setPlayerStatusAction(formData);
      router.refresh();
    });
  }

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value as PlayerStatus)}
      aria-label="סטטוס שחקן"
      className="border-border bg-bg-surface text-text-primary rounded-md border px-2 py-1 text-sm disabled:opacity-60"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {PLAYER_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
