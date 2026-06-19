"use client";

import { Button } from "@/components/ui/button";
import { deleteTeamAction } from "./actions";

export function TeamDeleteButton({ teamId }: { teamId: string }) {
  return (
    <form action={deleteTeamAction}>
      <input type="hidden" name="teamId" value={teamId} />
      <Button type="submit" size="sm" variant="ghost">
        מחיקה
      </Button>
    </form>
  );
}
