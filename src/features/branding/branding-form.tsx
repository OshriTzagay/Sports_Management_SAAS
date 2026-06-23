"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBrandingAction, type UpdateBrandingState } from "./actions";
import type { ClubBranding } from "./types";

const initialState: UpdateBrandingState = { error: null };

export function BrandingForm({ branding }: { branding: ClubBranding | null }) {
  const [state, formAction, pending] = useActionState(
    updateBrandingAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="text-text-body flex flex-col gap-1 text-sm">
        שם תצוגה
        <Input
          name="displayName"
          placeholder="שם המועדון כפי שיוצג"
          defaultValue={branding?.display_name ?? ""}
        />
      </label>

      <label className="text-text-body flex flex-col gap-1 text-sm">
        צבע מותג
        <div className="flex items-center gap-3">
          <Input
            name="primaryColor"
            type="color"
            defaultValue={branding?.primary_color ?? "#2e8b57"}
            className="h-10 w-16 p-1"
          />
          <span className="text-text-muted text-xs">
            הצבע נטען מיד בכל המערכת (כפתורים, הדגשות).
          </span>
        </div>
      </label>

      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      {state.ok && <p className="text-success-text text-sm">נשמר ✓</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "שומר…" : "שמירה"}
      </Button>
    </form>
  );
}
