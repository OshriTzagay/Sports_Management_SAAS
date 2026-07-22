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
  const [birthDate, setBirthDate] = useState("");

  if (state.status === "created") {
    return (
      <PaymentStep
        registrationId={state.registrationId}
        amountAgorot={state.amountAgorot}
        currency={state.currency}
      />
    );
  }

  const age = calculateAge(birthDate);
  const isMinor = age !== null && age < ADULT_AGE;
  const showPayer = age !== null;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="slug" value={slug} />

      <span className="text-text-muted text-xs font-medium">פרטי השחקן</span>
      <div className="flex gap-2">
        <Input name="playerFirstName" placeholder="שם פרטי" required />
        <Input name="playerLastName" placeholder="שם משפחה" required />
      </div>
      <Input
        name="playerNationalId"
        placeholder="ת.ז. של השחקן"
        inputMode="numeric"
        required
      />
      <label className="text-text-muted flex flex-col gap-1 text-xs">
        תאריך לידה
        <Input
          name="birthDate"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
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
                <Input name="contactFirstName" placeholder="שם פרטי" required />
                <Input name="contactLastName" placeholder="שם משפחה" />
              </div>
              <Input
                name="contactNationalId"
                placeholder="ת.ז. של המשלם"
                inputMode="numeric"
                required
              />
              <label className="text-text-muted flex flex-col gap-1 text-xs">
                קרבה
                <select
                  name="relationship"
                  defaultValue=""
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
            required
          />
          <Input
            name="contactEmail"
            type="email"
            placeholder="אימייל (אופציונלי)"
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
