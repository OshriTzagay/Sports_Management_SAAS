"use client";

import { Button } from "@/components/ui/button";
import { activateSeasonAction, closeSeasonAction } from "./actions";
import type { Season } from "./types";

export function SeasonRowActions({ season }: { season: Season }) {
  return (
    <div className="flex items-center justify-end gap-2">
      {!season.is_active && season.status === "active" && (
        <form action={activateSeasonAction}>
          <input type="hidden" name="seasonId" value={season.id} />
          <Button type="submit" size="sm" variant="secondary">
            הפעלה
          </Button>
        </form>
      )}
      {season.status === "active" && (
        <form action={closeSeasonAction}>
          <input type="hidden" name="seasonId" value={season.id} />
          <Button type="submit" size="sm" variant="ghost">
            סגירה
          </Button>
        </form>
      )}
    </div>
  );
}
