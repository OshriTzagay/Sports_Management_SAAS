"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClubAction, type CreateClubState } from "./actions";

const initialState: CreateClubState = { status: "idle" };

export function CreateClubForm() {
  const [state, formAction, pending] = useActionState(
    createClubAction,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="bg-success-bg text-success-text flex flex-col gap-2 rounded-md p-4 text-sm">
        <p className="font-medium">
          המועדון &quot;{state.clubName}&quot; הוקם ✓
        </p>
        <p>מנהל: {state.adminEmail}</p>
        <p>
          סיסמה זמנית (העבר למנהל, יש להחליף בכניסה ראשונה):{" "}
          <code className="bg-bg-surface rounded px-1.5 py-0.5">
            {state.tempPassword}
          </code>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Input name="clubName" placeholder="שם המועדון" required />
      <Input
        name="slug"
        placeholder="מזהה (subdomain) — למשל hapoel-ta"
        required
      />
      <Input name="adminFullName" placeholder="שם מנהל המועדון" required />
      <Input
        name="adminEmail"
        type="email"
        placeholder="אימייל המנהל"
        required
      />
      <Input
        name="seasonName"
        placeholder="עונה ראשונה — למשל 2025/26"
        required
      />
      {state.status === "error" && (
        <p className="text-danger text-sm">{state.error}</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "מקים מועדון…" : "הקמת מועדון"}
      </Button>
    </form>
  );
}
