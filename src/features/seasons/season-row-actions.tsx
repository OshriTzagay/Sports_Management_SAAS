"use client";

import { Button } from "@/components/ui/button";
import {
  activateSeasonAction,
  closeSeasonAction,
  reopenSeasonAction,
} from "./actions";
import type { Season } from "./types";

export function SeasonRowActions({ season }: { season: Season }) {
  const isClosed = season.status === "closed";

  return (
    <div className="flex items-center justify-end gap-2">
      {!season.is_active && !isClosed && (
        <form action={activateSeasonAction}>
          <input type="hidden" name="seasonId" value={season.id} />
          <Button type="submit" size="sm" variant="secondary">
            הפעלה
          </Button>
        </form>
      )}
      {!season.is_active && !isClosed && (
        <form action={closeSeasonAction}>
          <input type="hidden" name="seasonId" value={season.id} />
          <Button type="submit" size="sm" variant="ghost">
            סגירה
          </Button>
        </form>
      )}
      {isClosed && (
        <form action={reopenSeasonAction}>
          <input type="hidden" name="seasonId" value={season.id} />
          <Button type="submit" size="sm" variant="ghost">
            פתיחה מחדש
          </Button>
        </form>
      )}
    </div>
  );
}
