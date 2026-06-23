"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBrandingAction, type UpdateBrandingState } from "./actions";
import type { ClubBranding } from "./types";

const initialState: UpdateBrandingState = { error: null };

const SWATCHES = [
  "#2e8b57",
  "#0f6e56",
  "#378add",
  "#534ab7",
  "#d4537e",
  "#c7472e",
  "#ba7517",
  "#2a2a28",
];

function BrandingOverlay({ color }: { color: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5"
      style={{ background: `color-mix(in oklab, ${color}, black 8%)` }}
    >
      <div className="size-14 animate-spin rounded-full border-4 border-white/25 border-t-white" />
      <p className="text-lg font-medium text-white">מחיל מיתוג…</p>
    </div>
  );
}

export function BrandingForm({ branding }: { branding: ClubBranding | null }) {
  const [state, formAction, pending] = useActionState(
    updateBrandingAction,
    initialState,
  );
  const [color, setColor] = useState(branding?.primary_color ?? "#2e8b57");

  const tintBg = `color-mix(in oklab, ${color}, white 86%)`;
  const tintText = `color-mix(in oklab, ${color}, black 32%)`;

  return (
    <>
      <form action={formAction} className="flex flex-col gap-4">
        <label className="text-text-body flex flex-col gap-1 text-sm">
          שם תצוגה
          <Input
            name="displayName"
            placeholder="שם המועדון כפי שיוצג"
            defaultValue={branding?.display_name ?? ""}
          />
        </label>

        <div className="text-text-body flex flex-col gap-2 text-sm">
          צבע מותג
          <div className="flex flex-wrap items-center gap-2">
            {SWATCHES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setColor(s)}
                aria-label={`בחירת ${s}`}
                className="size-7 rounded-full transition-transform hover:scale-110"
                style={{
                  background: s,
                  outline: color === s ? `2px solid ${s}` : "none",
                  outlineOffset: "2px",
                }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              aria-label="צבע מותאם"
              className="border-border bg-bg-surface h-8 w-10 cursor-pointer rounded-md border p-1"
            />
            <span className="text-text-muted text-xs">{color}</span>
          </div>
        </div>

        <div className="border-border flex items-center gap-3 rounded-md border p-3">
          <span className="text-text-muted text-xs">תצוגה מקדימה:</span>
          <span
            className="rounded-md px-3 py-1.5 text-sm font-medium text-white"
            style={{ background: color }}
          >
            כפתור
          </span>
          <span
            className="rounded-sm px-2 py-0.5 text-xs font-medium"
            style={{ background: tintBg, color: tintText }}
          >
            תגית
          </span>
        </div>

        <input type="hidden" name="primaryColor" value={color} />

        {state.error && <p className="text-danger text-sm">{state.error}</p>}
        {state.ok && <p className="text-success-text text-sm">נשמר ✓</p>}

        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "שומר…" : "שמירה והחלה"}
        </Button>
      </form>

      {pending && <BrandingOverlay color={color} />}
    </>
  );
}
