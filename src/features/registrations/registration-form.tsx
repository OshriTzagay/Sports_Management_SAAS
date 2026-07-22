"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { calculateAge } from "@/features/players/age";
import { formatAgorot } from "@/features/payments/types";
import { isValidIsraeliId } from "@/lib/israeli-id";
import { normalizeIsraeliPhone } from "@/lib/phone";
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
  "h-11 w-full rounded-md border border-border bg-bg-surface px-3 text-sm text-text-primary";

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

/** חיווי ✓/✗ חי מתחת לשדה. */
function FieldHint({ ok, show }: { ok: boolean; show: boolean }) {
  if (!show) return null;
  return ok ? (
    <span className="text-success-text text-[0.7rem]">✓ תקין</span>
  ) : (
    <span className="text-danger text-[0.7rem]">✗ בדוק שוב</span>
  );
}

function Stepper({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-xs">
      {[
        { n: 1, label: "פרטים" },
        { n: 2, label: "תשלום" },
      ].map((s, i) => (
        <div key={s.n} className="flex items-center gap-2">
          <span
            className={
              step >= s.n
                ? "bg-primary-500 flex size-6 items-center justify-center rounded-full font-bold text-white"
                : "bg-bg-muted text-text-muted flex size-6 items-center justify-center rounded-full"
            }
          >
            {s.n}
          </span>
          <span
            className={step >= s.n ? "text-text-primary" : "text-text-muted"}
          >
            {s.label}
          </span>
          {i === 0 && <span className="text-text-muted">›</span>}
        </div>
      ))}
    </div>
  );
}

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
        playerName={`${form.playerFirstName} ${form.playerLastName}`.trim()}
      />
    );
  }

  const age = calculateAge(form.birthDate);
  const isMinor = age !== null && age < ADULT_AGE;
  const isAdult = age !== null && age >= ADULT_AGE;
  const showPayer = age !== null;

  const playerIdOk = isValidIsraeliId(form.playerNationalId);
  const contactIdOk = isValidIsraeliId(form.contactNationalId);
  const phoneOk = normalizeIsraeliPhone(form.contactPhone) !== null;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Stepper step={1} />
      <input type="hidden" name="slug" value={slug} />

      <span className="text-text-muted text-xs font-medium">פרטי השחקן</span>
      <div className="flex gap-2">
        <Input
          name="playerFirstName"
          placeholder="שם פרטי"
          autoComplete="given-name"
          value={form.playerFirstName}
          onChange={set("playerFirstName")}
          required
        />
        <Input
          name="playerLastName"
          placeholder="שם משפחה"
          autoComplete="family-name"
          value={form.playerLastName}
          onChange={set("playerLastName")}
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <Input
          name="playerNationalId"
          placeholder="ת.ז. של השחקן"
          inputMode="numeric"
          value={form.playerNationalId}
          onChange={set("playerNationalId")}
          required
        />
        <FieldHint ok={playerIdOk} show={form.playerNationalId.length >= 5} />
      </div>
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

      {/* אינדיקטור גיל — הענף הופך שקוף */}
      {isMinor && (
        <span className="bg-primary-50 text-primary-700 w-fit rounded-full px-3 py-1 text-xs">
          שחקן קטין ({age}) · נדרשים פרטי הורה/משלם
        </span>
      )}
      {isAdult && (
        <div className="border-primary-300/40 bg-primary-50 text-primary-700 rounded-md border px-3 py-2 text-xs">
          <span className="font-bold">אתה בוגר ({age}).</span> הפרטים שלמעלה הם
          שלך כשחקן — ואתה נרשם ומשלם על עצמך. נותר רק טלפון ליצירת קשר.
        </div>
      )}

      {showPayer && (
        <div className="border-border flex flex-col gap-3 border-t pt-3">
          {isMinor && (
            <>
              <span className="text-text-muted text-xs font-medium">
                פרטי ההורה / המשלם
              </span>
              <div className="flex gap-2">
                <Input
                  name="contactFirstName"
                  placeholder="שם פרטי"
                  autoComplete="given-name"
                  value={form.contactFirstName}
                  onChange={set("contactFirstName")}
                  required
                />
                <Input
                  name="contactLastName"
                  placeholder="שם משפחה"
                  autoComplete="family-name"
                  value={form.contactLastName}
                  onChange={set("contactLastName")}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Input
                  name="contactNationalId"
                  placeholder="ת.ז. של המשלם"
                  inputMode="numeric"
                  value={form.contactNationalId}
                  onChange={set("contactNationalId")}
                  required
                />
                <FieldHint
                  ok={contactIdOk}
                  show={form.contactNationalId.length >= 5}
                />
              </div>
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

          <div className="flex flex-col gap-1">
            <Input
              name="contactPhone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="טלפון — למשל 050-1234567"
              value={form.contactPhone}
              onChange={set("contactPhone")}
              required
            />
            <FieldHint ok={phoneOk} show={form.contactPhone.length >= 9} />
          </div>
          <Input
            name="contactEmail"
            type="email"
            autoComplete="email"
            placeholder="אימייל (אופציונלי)"
            value={form.contactEmail}
            onChange={set("contactEmail")}
          />
        </div>
      )}

      {state.status === "error" && (
        <p className="text-danger text-sm">{state.error}</p>
      )}
      <Button type="submit" disabled={pending} className="h-12 text-base">
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
  playerName,
}: {
  registrationId: string;
  amountAgorot: number;
  currency: string;
  playerName: string;
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
      <Stepper step={2} />
      <input type="hidden" name="registrationId" value={registrationId} />
      <div className="border-border bg-bg-surface flex flex-col gap-2 rounded-lg border p-4">
        {playerName && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">רישום עבור</span>
            <span className="text-text-primary font-medium">{playerName}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-text-muted text-sm">סכום לתשלום</span>
          <span className="text-text-primary text-xl font-bold">
            {formatAgorot(amountAgorot, currency)}
          </span>
        </div>
      </div>
      <p className="bg-warning-bg text-warning-text rounded-md px-3 py-2 text-xs">
        מצב בדיקה — התשלום מדומה (יוחלף בסליקת Tranzila).
      </p>
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending} className="h-12 text-base">
        {pending ? <Spinner className="size-5" /> : "תשלום (סימולציה)"}
      </Button>
    </form>
  );
}
