"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Spinner } from "@/components/ui/spinner";
import { inviteStaffAction, type InviteStaffState } from "./actions";
import type { AssignableRole } from "./types";

const initialState: InviteStaffState = { status: "idle" };

export function InviteStaffForm({ roles }: { roles: AssignableRole[] }) {
  const [state, formAction, pending] = useActionState(
    inviteStaffAction,
    initialState,
  );
  const [roleId, setRoleId] = useState("");

  if (state.status === "success") {
    return (
      <div className="bg-success-bg text-success-text flex flex-col gap-2 rounded-md p-4 text-sm">
        <p className="font-medium">המשתמש נוצר ✓</p>
        <p>{state.email}</p>
        <p>
          סיסמה זמנית (העבר למשתמש — יש להחליף בכניסה הראשונה):{" "}
          <code className="bg-bg-surface rounded px-1.5 py-0.5">
            {state.tempPassword}
          </code>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Input name="fullName" placeholder="שם מלא" required />
      <Input name="email" type="email" placeholder="אימייל" required />
      <Input
        name="phone"
        type="tel"
        inputMode="tel"
        placeholder="טלפון (לכניסה ב-SMS — אופציונלי)"
      />
      <SearchableSelect
        name="roleId"
        value={roleId}
        onChange={setRoleId}
        options={roles.map((r) => ({ value: r.id, label: r.name }))}
        placeholder="תפקיד…"
        searchPlaceholder="חיפוש תפקיד…"
      />
      {state.status === "error" && (
        <p className="text-danger text-sm">{state.error}</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : "הזמנת משתמש"}
      </Button>
    </form>
  );
}
