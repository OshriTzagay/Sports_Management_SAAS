"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  updateBillingSettingsAction,
  type BillingSettingsState,
} from "./actions";
import { CURRENCY_LABELS, type BillingSettings } from "./types";

const initialState: BillingSettingsState = { error: null };
const selectClass =
  "h-10 w-full rounded-md border border-border bg-bg-surface px-3 text-sm text-text-primary";

export function BillingSettingsForm({
  settings,
  registrationUrl,
}: {
  settings: BillingSettings;
  registrationUrl?: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateBillingSettingsAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-text-muted flex flex-col gap-1 text-xs">
        שיעור מע״מ (%)
        <Input
          name="vatRate"
          type="number"
          min={0}
          max={100}
          step="0.01"
          defaultValue={settings.vat_rate}
          inputMode="decimal"
        />
        <span className="text-text-muted text-[0.7rem]">
          0% = עמותה פטורה. השיעור נשמר היסטורית על כל חיוב.
        </span>
      </label>
      <label className="text-text-muted flex flex-col gap-1 text-xs">
        מטבע
        <select
          name="currency"
          defaultValue={settings.currency}
          className={selectClass}
        >
          {Object.entries(CURRENCY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="border-border flex flex-col gap-3 border-t pt-3">
        <span className="text-text-primary text-xs font-medium">
          הרשמה עצמית ציבורית
        </span>
        <label className="text-text-muted flex flex-col gap-1 text-xs">
          דמי רישום (₪)
          <Input
            name="registrationFee"
            type="number"
            min={0}
            step="0.01"
            defaultValue={(settings.registration_fee_agorot / 100).toFixed(2)}
            inputMode="decimal"
          />
        </label>
        <label className="text-text-body flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="registrationOpen"
            defaultChecked={settings.registration_open}
            className="size-4"
          />
          הרשמה פתוחה (הקישור הציבורי פעיל)
        </label>
        {registrationUrl && (
          <p className="text-text-muted text-[0.7rem] break-all">
            קישור להרשמה:{" "}
            <code className="bg-bg-muted rounded px-1 py-0.5">
              {registrationUrl}
            </code>
          </p>
        )}
      </div>
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      {state.ok && <p className="text-success-text text-sm">נשמר ✓</p>}
      <Button
        type="submit"
        variant="secondary"
        disabled={pending}
        className="self-start"
      >
        {pending ? <Spinner className="size-4" /> : "שמירת הגדרות חיוב"}
      </Button>
    </form>
  );
}
