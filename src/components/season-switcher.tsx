"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { selectSeasonAction } from "@/features/seasons/actions";
import type { Season } from "@/features/seasons";

function suffix(season: Season): string {
  if (season.is_active) return " (פעילה)";
  if (season.status === "closed") return " (סגורה)";
  return "";
}

export function SeasonSwitcher({
  seasons,
  selectedId,
}: {
  seasons: Season[];
  selectedId: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleChange(seasonId: string) {
    const formData = new FormData();
    formData.set("seasonId", seasonId);
    startTransition(async () => {
      await selectSeasonAction(formData);
      router.refresh();
    });
  }

  return (
    <select
      value={selectedId ?? ""}
      disabled={pending || seasons.length === 0}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="בחירת עונה"
      className="border-border bg-bg-surface text-text-primary w-full rounded-md border px-2 py-1 text-xs disabled:opacity-60"
    >
      {seasons.length === 0 && <option value="">—</option>}
      {seasons.map((season) => (
        <option key={season.id} value={season.id}>
          {season.name}
          {suffix(season)}
        </option>
      ))}
    </select>
  );
}
