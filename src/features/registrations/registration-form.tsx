"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { calculateAge } from "@/features/players/age";
import { formatAgorot } from "@/features/payments/types";
import {
  payRegistrationMockAction,
  submitRegistrationAction,
  type PayState,
  type RegistrationFormState,
} from "./actions";

const ADULT_AGE = 18;
const submitInitial: RegistrationFormState = { status: "idle" };
const payInitial: PayState = { error: null };
const selectClass =
  "h-10 w-full rounded-md border border-border bg-bg-surface px-3 text-sm text-text-primary";

const EMPTY = {
  playerFirstName: "",
  playerLastName: "",
  playerNationalId: "",
  birthDate: "",
  contactFirstName: "",
  contactLastName: "",
  contactNationalId: "",
  relationship: "",
  contactPhone: "",
  contactEmail: "",
};

export function RegistrationForm({
  slug,
  feeAgorot,
  currency,
}: {
  slug: string;
  feeAgorot: number;
  currency: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitRegistrationAction,
    submitInitial,
  );
  // controlled — כדי שהערכים ישרדו את איפוס-הטופס האוטומטי של React 19 בשגיאה.
  const [form, setForm] = useState(EMPTY);
  const set =
    (key: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  if (state.status === "created") {
    return (
      <PaymentStep
        registrationId={state.registrationId}
        amountAgorot={state.amountAgorot}
        currency={state.currency}
      />
    );
  }

  const age = calculateAge(form.birthDate);
  const isMinor = age !== null && age < ADULT_AGE;
  const showPayer = age !== null;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="slug" value={slug} />

      <span className="text-text-muted text-xs font-medium">פרטי השחקן</span>
      <div className="flex gap-2">
        <Input
          name="playerFirstName"
          placeholder="שם פרטי"
          value={form.playerFirstName}
          onChange={set("playerFirstName")}
          required
        />
        <Input
          name="playerLastName"
          placeholder="שם משפחה"
          value={form.playerLastName}
          onChange={set("playerLastName")}
          required
        />
      </div>
      <Input
        name="playerNationalId"
        placeholder="ת.ז. של השחקן"
        inputMode="numeric"
        value={form.playerNationalId}
        onChange={set("playerNationalId")}
        required
      />
      <label className="text-text-muted flex flex-col gap-1 text-xs">
        תאריך לידה
        <Input
          name="birthDate"
          type="date"
          value={form.birthDate}
          onChange={set("birthDate")}
          required
        />
      </label>

      {showPayer && (
        <div className="border-border flex flex-col gap-3 border-t pt-3">
          <span className="text-text-muted text-xs font-medium">
            {isMinor ? "פרטי ההורה / המשלם" : "פרטי התשלום"}
          </span>

          {isMinor && (
            <>
              <div className="flex gap-2">
                <Input
                  name="contactFirstName"
                  placeholder="שם פרטי"
                  value={form.contactFirstName}
                  onChange={set("contactFirstName")}
                  required
                />
                <Input
                  name="contactLastName"
                  placeholder="שם משפחה"
                  value={form.contactLastName}
                  onChange={set("contactLastName")}
                />
              </div>
              <Input
                name="contactNationalId"
                placeholder="ת.ז. של המשלם"
                inputMode="numeric"
                value={form.contactNationalId}
                onChange={set("contactNationalId")}
                required
              />
              <label className="text-text-muted flex flex-col gap-1 text-xs">
                קרבה
                <select
                  name="relationship"
                  value={form.relationship}
                  onChange={set("relationship")}
                  className={selectClass}
                  required
                >
                  <option value="" disabled>
                    בחירה…
                  </option>
                  <option value="father">אבא</option>
                  <option value="mother">אמא</option>
                  <option value="guardian">אפוטרופוס</option>
                </select>
              </label>
            </>
          )}

          {!isMinor && (
            <p className="text-text-muted text-xs">
              כבגיר, הרישום והתשלום על שמך.
            </p>
          )}

          <Input
            name="contactPhone"
            type="tel"
            inputMode="tel"
            placeholder="טלפון — למשל 050-1234567"
            value={form.contactPhone}
            onChange={set("contactPhone")}
            required
          />
          <Input
            name="contactEmail"
            type="email"
            placeholder="אימייל (אופציונלי)"
            value={form.contactEmail}
            onChange={set("contactEmail")}
          />
        </div>
      )}

      {state.status === "error" && (
        <p className="text-danger text-sm">{state.error}</p>
      )}
      <Button type="submit" disabled={pending} className="h-11 text-base">
        {pending ? (
          <Spinner className="size-5" />
        ) : (
          `המשך לתשלום · ${formatAgorot(feeAgorot, currency)}`
        )}
      </Button>
    </form>
  );
}

function PaymentStep({
  registrationId,
  amountAgorot,
  currency,
}: {
  registrationId: string;
  amountAgorot: number;
  currency: string;
}) {
  const [state, formAction, pending] = useActionState(
    payRegistrationMockAction,
    payInitial,
  );

  if (state.done) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="bg-success-bg text-success-text flex size-14 items-center justify-center rounded-full text-2xl">
          ✓
        </span>
        <h2 className="text-text-primary text-lg font-bold">נרשמת בהצלחה!</h2>
        <p className="text-text-muted text-sm">
          התשלום התקבל והרישום הושלם. נתראה במגרש 🏆
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="registrationId" value={registrationId} />
      <div className="border-border bg-bg-surface flex items-center justify-between rounded-lg border p-4">
        <span className="text-text-muted text-sm">סכום לתשלום</span>
        <span className="text-text-primary text-xl font-bold">
          {formatAgorot(amountAgorot, currency)}
        </span>
      </div>
      <p className="bg-warning-bg text-warning-text rounded-md px-3 py-2 text-xs">
        מצב בדיקה — התשלום מדומה (יוחלף בסליקת Tranzila).
      </p>
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending} className="h-11 text-base">
        {pending ? <Spinner className="size-5" /> : "תשלום (סימולציה)"}
      </Button>
    </form>
  );
}
