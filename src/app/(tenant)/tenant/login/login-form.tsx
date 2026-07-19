"use client";

import { useActionState, useState, useTransition } from "react";

import {
  sendPhoneOtp,
  signInTenant,
  verifyPhoneOtp,
  type SignInState,
} from "@/features/tenant-auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const signInInitial: SignInState = { error: null };

type Mode = "email" | "sms";

export function TenantLoginForm() {
  const [mode, setMode] = useState<Mode>("email");
  const [reset, setReset] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="border-border bg-bg-muted/40 flex rounded-lg border p-1 text-sm">
        <TabButton
          active={mode === "email"}
          onClick={() => {
            setMode("email");
            setReset(false);
          }}
        >
          אימייל וסיסמה
        </TabButton>
        <TabButton
          active={mode === "sms"}
          onClick={() => {
            setMode("sms");
            setReset(false);
          }}
        >
          קוד ב-SMS
        </TabButton>
      </div>

      {mode === "email" ? (
        <EmailLoginForm
          onForgot={() => {
            setReset(true);
            setMode("sms");
          }}
        />
      ) : (
        <SmsLoginForm reset={reset} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md px-3 py-1.5 transition-all",
        active
          ? "bg-bg-surface text-primary-700 font-medium shadow-sm"
          : "text-text-muted hover:text-text-primary",
      )}
    >
      {children}
    </button>
  );
}

function EmailLoginForm({ onForgot }: { onForgot: () => void }) {
  const [state, formAction, pending] = useActionState(
    signInTenant,
    signInInitial,
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
        {pending ? <Spinner className="size-4" /> : "התחברות"}
      </Button>
      <button
        type="button"
        onClick={onForgot}
        className="text-text-muted hover:text-primary-700 text-xs underline"
      >
        שכחת סיסמה? אפס עם קוד ב-SMS
      </button>
    </form>
  );
}

function SmsLoginForm({ reset }: { reset: boolean }) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function send() {
    const formData = new FormData();
    formData.set("phone", phone);
    setError(null);
    startTransition(async () => {
      const res = await sendPhoneOtp({ error: null }, formData);
      if (res.error) setError(res.error);
      else setStep("code");
    });
  }

  function verify() {
    const formData = new FormData();
    formData.set("phone", phone);
    formData.set("token", code);
    if (reset) formData.set("next", "/set-password");
    setError(null);
    startTransition(async () => {
      // הצלחה גורמת ל-redirect בצד השרת; נגיע לכאן רק בשגיאה.
      const res = await verifyPhoneOtp({ error: null }, formData);
      if (res?.error) setError(res.error);
    });
  }

  if (step === "code") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-text-muted text-sm">
          שלחנו קוד למספר <span dir="ltr">{phone}</span>
        </p>
        <Input
          name="token"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="------"
          className="text-center text-lg tracking-[0.4em]"
          required
        />
        {error && <p className="text-danger text-sm">{error}</p>}
        <Button type="button" onClick={verify} disabled={pending || !code}>
          {pending ? <Spinner className="size-4" /> : reset ? "המשך" : "כניסה"}
        </Button>
        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setCode("");
              setError(null);
            }}
            className="text-text-muted hover:text-primary-700 underline"
          >
            שינוי מספר
          </button>
          <button
            type="button"
            onClick={send}
            disabled={pending}
            className="text-text-muted hover:text-primary-700 underline disabled:opacity-50"
          >
            שליחה חוזרת
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reset && (
        <p className="text-text-muted text-sm">
          נשלח אליך קוד לאימות, ולאחר מכן תוכל לבחור סיסמה חדשה.
        </p>
      )}
      <Input
        name="phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        inputMode="tel"
        autoComplete="tel"
        placeholder="טלפון — למשל 050-1234567"
        required
      />
      {error && <p className="text-danger text-sm">{error}</p>}
      <Button type="button" onClick={send} disabled={pending || !phone}>
        {pending ? <Spinner className="size-4" /> : "שליחת קוד"}
      </Button>
    </div>
  );
}
