"use client";

import { useActionState } from "react";

import {
  updatePasswordAction,
  type UpdatePasswordState,
} from "@/features/tenant-auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: UpdatePasswordState = { error: null };

export function SetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        name="password"
        type="password"
        placeholder="סיסמה חדשה (לפחות 8 תווים)"
        autoComplete="new-password"
        minLength={8}
        required
      />
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "שומר…" : "שמירת סיסמה"}
      </Button>
    </form>
  );
}
