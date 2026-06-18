"use client";

import { useActionState } from "react";

import {
  signInPlatform,
  type SignInState,
} from "@/features/platform-auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: SignInState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    signInPlatform,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        name="email"
        type="email"
        placeholder="אימייל"
        autoComplete="email"
        required
      />
      <Input
        name="password"
        type="password"
        placeholder="סיסמה"
        autoComplete="current-password"
        required
      />
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "מתחבר…" : "התחברות"}
      </Button>
    </form>
  );
}
