"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTeamAction, type CreateTeamState } from "./actions";

const initialState: CreateTeamState = { error: null };

export function CreateTeamForm({ seasonId }: { seasonId: string }) {
  const [state, formAction, pending] = useActionState(
    createTeamAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="seasonId" value={seasonId} />
      <Input name="name" placeholder="שם הקבוצה — למשל נוער ב'" required />
      <Input name="ageCategory" placeholder="קטגוריית גיל (אופציונלי)" />
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "יוצר…" : "קבוצה חדשה"}
      </Button>
    </form>
  );
}
