"use client";

import { useActionState, useState } from "react";
import { Check, CreditCard, User, Wallet } from "lucide-react";

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
  "h-11 w-full rounded-lg border border-border bg-bg-surface px-3 text-sm text-text-primary";
const inputClass = "h-11 rounded-lg";

const REL_LABELS: Record<string, string> = {
  father: "אבא",
  mother: "אמא",
  guardian: "אפוטרופוס",
  self: "עצמי",
};

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
type FormData = typeof EMPTY;

function Progress({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs font-medium">
        <span className={step >= 1 ? "text-primary-700" : "text-text-muted"}>
          1 · פרטים
        </span>
        <span className={step >= 2 ? "text-primary-700" : "text-text-muted"}>
          2 · אישור ותשלום
        </span>
      </div>
      <div className="bg-bg-muted h-1.5 overflow-hidden rounded-full">
        <div
          className="bg-primary-500 h-full rounded-full transition-all duration-300"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>
    </div>
  );
}

function SectionHead({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="text-text-primary flex items-center gap-2 text-sm font-bold">
      <span className="bg-primary-50 text-primary-700 flex size-7 items-center justify-center rounded-lg">
        {icon}
      </span>
      {children}
    </div>
  );
}

function Field({
  label,
  ok,
  showHint,
  children,
}: {
  label: string;
  ok?: boolean;
  showHint?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-text-muted text-xs font-medium">{label}</span>
      {children}
      {showHint &&
        (ok ? (
          <span className="text-success-text text-[0.7rem]">✓ תקין</span>
        ) : (
          <span className="text-danger text-[0.7rem]">✗ בדוק שוב</span>
        ))}
    </label>
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
  const [form, setForm] = useState<FormData>(EMPTY);
  const set =
    (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  if (state.status === "already_registered") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <span className="bg-success-bg text-success-text flex size-16 items-center justify-center rounded-full text-3xl">
          ✓
        </span>
        <h2 className="text-text-primary text-xl font-bold">
          השחקן כבר רשום לעונה
        </h2>
        <p className="text-text-muted text-sm">
          קיימת הרשמה ששולמה עבור ת.ז. זו בעונה הנוכחית. אין צורך לשלם שוב.
        </p>
      </div>
    );
  }

  if (state.status === "created") {
    return (
      <PaymentStep
        registrationId={state.registrationId}
        amountAgorot={state.amountAgorot}
        currency={state.currency}
        form={form}
      />
    );
  }

  const age = calculateAge(form.birthDate);
  const isMinor = age !== null && age < ADULT_AGE;
  const isAdult = age !== null && age >= ADULT_AGE;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Progress step={1} />
      <input type="hidden" name="slug" value={slug} />

      <div className="flex flex-col gap-3">
        <SectionHead icon={<User className="size-4" />}>פרטי השחקן</SectionHead>
        <div className="flex gap-2">
          <Input
            name="playerFirstName"
            placeholder="שם פרטי"
            autoComplete="given-name"
            className={inputClass}
            value={form.playerFirstName}
            onChange={set("playerFirstName")}
            required
          />
          <Input
            name="playerLastName"
            placeholder="שם משפחה"
            autoComplete="family-name"
            className={inputClass}
            value={form.playerLastName}
            onChange={set("playerLastName")}
            required
          />
        </div>
        <Field
          label="ת.ז. של השחקן"
          ok={isValidIsraeliId(form.playerNationalId)}
          showHint={form.playerNationalId.length >= 5}
        >
          <Input
            name="playerNationalId"
            inputMode="numeric"
            className={inputClass}
            value={form.playerNationalId}
            onChange={set("playerNationalId")}
            required
          />
        </Field>
        <Field label="תאריך לידה">
          <Input
            name="birthDate"
            type="date"
            className={inputClass}
            value={form.birthDate}
            onChange={set("birthDate")}
            required
          />
        </Field>

        {isMinor && (
          <span className="bg-primary-50 text-primary-700 w-fit rounded-full px-3 py-1 text-xs">
            שחקן קטין (גיל {age}) · נדרשים פרטי הורה
          </span>
        )}
        {isAdult && (
          <div className="border-primary-300/40 bg-primary-50 text-primary-700 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs">
            <Check className="mt-0.5 size-4 shrink-0" />
            <span>
              <span className="font-bold">אתה בוגר (גיל {age}).</span> הפרטים
              שלמעלה הם שלך כשחקן — ואתה נרשם ומשלם על עצמך. נותר רק טלפון
              ליצירת קשר.
            </span>
          </div>
        )}
      </div>

      {age !== null && (
        <div className="border-border flex flex-col gap-3 border-t pt-4">
          <SectionHead icon={<Wallet className="size-4" />}>
            {isMinor ? "פרטי ההורה / המשלם" : "פרטי התקשרות ותשלום"}
          </SectionHead>

          {isMinor && (
            <>
              <div className="flex gap-2">
                <Input
                  name="contactFirstName"
                  placeholder="שם פרטי"
                  autoComplete="given-name"
                  className={inputClass}
                  value={form.contactFirstName}
                  onChange={set("contactFirstName")}
                  required
                />
                <Input
                  name="contactLastName"
                  placeholder="שם משפחה"
                  autoComplete="family-name"
                  className={inputClass}
                  value={form.contactLastName}
                  onChange={set("contactLastName")}
                />
              </div>
              <Field
                label="ת.ז. של המשלם"
                ok={isValidIsraeliId(form.contactNationalId)}
                showHint={form.contactNationalId.length >= 5}
              >
                <Input
                  name="contactNationalId"
                  inputMode="numeric"
                  className={inputClass}
                  value={form.contactNationalId}
                  onChange={set("contactNationalId")}
                  required
                />
              </Field>
              <Field label="קרבה">
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
              </Field>
            </>
          )}

          <Field
            label="טלפון"
            ok={normalizeIsraeliPhone(form.contactPhone) !== null}
            showHint={form.contactPhone.length >= 9}
          >
            <Input
              name="contactPhone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="050-1234567"
              className={inputClass}
              value={form.contactPhone}
              onChange={set("contactPhone")}
              required
            />
          </Field>
          <Field label="אימייל (אופציונלי)">
            <Input
              name="contactEmail"
              type="email"
              autoComplete="email"
              className={inputClass}
              value={form.contactEmail}
              onChange={set("contactEmail")}
            />
          </Field>
        </div>
      )}

      {state.status === "error" && (
        <p className="text-danger text-sm">{state.error}</p>
      )}
      <Button type="submit" disabled={pending} className="h-12 text-base">
        {pending ? (
          <Spinner className="size-5" />
        ) : (
          `המשך · ${formatAgorot(feeAgorot, currency)}`
        )}
      </Button>
    </form>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-primary text-end font-medium">{value}</span>
    </div>
  );
}

function PaymentStep({
  registrationId,
  amountAgorot,
  currency,
  form,
}: {
  registrationId: string;
  amountAgorot: number;
  currency: string;
  form: FormData;
}) {
  const [state, formAction, pending] = useActionState(
    payRegistrationMockAction,
    payInitial,
  );

  if (state.done) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <span className="bg-success-bg text-success-text flex size-16 items-center justify-center rounded-full text-3xl">
          ✓
        </span>
        <h2 className="text-text-primary text-xl font-bold">נרשמת בהצלחה!</h2>
        <p className="text-text-muted text-sm">
          התשלום התקבל והרישום הושלם. נתראה במגרש 🏆
        </p>
      </div>
    );
  }

  const age = calculateAge(form.birthDate);
  const isMinor = age !== null && age < ADULT_AGE;
  const playerName = `${form.playerFirstName} ${form.playerLastName}`.trim();
  const payerName = isMinor
    ? `${form.contactFirstName} ${form.contactLastName}`.trim()
    : playerName;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Progress step={2} />
      <input type="hidden" name="registrationId" value={registrationId} />

      <div className="border-border bg-bg-surface flex flex-col gap-3 rounded-lg border p-4">
        <SectionHead icon={<User className="size-4" />}>השחקן</SectionHead>
        <div className="flex flex-col gap-1.5">
          <SummaryRow label="שם" value={playerName} />
          <SummaryRow label="ת.ז." value={form.playerNationalId} />
          <SummaryRow
            label="תאריך לידה"
            value={
              form.birthDate
                ? `${new Date(form.birthDate).toLocaleDateString("he-IL")}${
                    age !== null ? ` · גיל ${age}` : ""
                  }`
                : ""
            }
          />
        </div>

        <div className="border-border border-t pt-3">
          <SectionHead icon={<Wallet className="size-4" />}>המשלם</SectionHead>
          <div className="mt-2 flex flex-col gap-1.5">
            <SummaryRow label="שם" value={payerName} />
            <SummaryRow
              label="ת.ז."
              value={isMinor ? form.contactNationalId : form.playerNationalId}
            />
            {isMinor && (
              <SummaryRow
                label="קרבה"
                value={REL_LABELS[form.relationship] ?? ""}
              />
            )}
            <SummaryRow label="טלפון" value={form.contactPhone} />
            <SummaryRow label="אימייל" value={form.contactEmail} />
          </div>
        </div>
      </div>

      <div className="border-primary-300/40 bg-primary-50 flex items-center justify-between rounded-lg border p-4">
        <span className="text-primary-700 flex items-center gap-2 text-sm font-medium">
          <CreditCard className="size-4" />
          סכום לתשלום
        </span>
        <span className="text-primary-700 text-2xl font-bold">
          {formatAgorot(amountAgorot, currency)}
        </span>
      </div>

      <p className="bg-warning-bg text-warning-text rounded-md px-3 py-2 text-xs">
        מצב בדיקה — התשלום מדומה (יוחלף בסליקת Tranzila).
      </p>
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending} className="h-12 text-base">
        {pending ? <Spinner className="size-5" /> : "אישור ותשלום"}
      </Button>
    </form>
  );
}
