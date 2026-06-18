"use client";

import { Button } from "@/components/ui/button";
import { setClubStatusAction } from "./actions";
import type { Club } from "./types";

/** כפתור השעיה/הפעלה למועדון בודד. */
export function ClubStatusToggle({
  clubId,
  status,
}: {
  clubId: string;
  status: Club["status"];
}) {
  const suspended = status === "suspended";
  const nextStatus = suspended ? "active" : "suspended";

  return (
    <form action={setClubStatusAction}>
      <input type="hidden" name="clubId" value={clubId} />
      <input type="hidden" name="status" value={nextStatus} />
      <Button
        type="submit"
        size="sm"
        variant={suspended ? "secondary" : "destructive"}
      >
        {suspended ? "הפעלה" : "השעיה"}
      </Button>
    </form>
  );
}
