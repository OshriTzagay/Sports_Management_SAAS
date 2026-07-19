"use client";

import { useActionState, useState } from "react";

import {
  sendPhoneOtp,
  signInTenant,
  verifyPhoneOtp,
  type PhoneOtpState,
  type SignInState,
} from "@/features/tenant-auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const signInInitial: SignInState = { error: null };
const otpInitial: PhoneOtpState = { error: null };

type Mode = "email" | "sms";

export function TenantLoginForm() {
  const [mode, setMode] = useState<Mode>("email");

  return (
    <div className="flex flex-col gap-4">
      <div className="border-border flex rounded-md border p-0.5 text-sm">
        <TabButton active={mode === "email"} onClick={() => setMode("email")}>
          אימייל וסיסמה
        </TabButton>
        <TabButton active={mode === "sms"} onClick={() => setMode("sms")}>
          קוד ב-SMS
        </TabButton>
      </div>
      {mode === "email" ? <EmailLoginForm /> : <SmsLoginForm />}
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
        "flex-1 rounded-[5px] px-3 py-1.5 transition-colors",
        active
          ? "bg-primary-50 text-primary-700 font-medium"
          : "text-text-muted hover:text-text-primary",
      )}
    >
      {children}
    </button>
  );
}

function EmailLoginForm() {
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
        {pending ? "מתחבר…" : "התחברות"}
      </Button>
    </form>
  );
}

function SmsLoginForm() {
  const [phone, setPhone] = useState("");
  const [sendState, sendAction, sending] = useActionState(
    sendPhoneOtp,
    otpInitial,
  );
  const [verifyState, verifyAction, verifying] = useActionState(
    verifyPhoneOtp,
    otpInitial,
  );

  if (sendState.sent) {
    return (
      <form action={verifyAction} className="flex flex-col gap-4">
        <input type="hidden" name="phone" value={phone} />
        <p className="text-text-muted text-sm">שלחנו קוד למספר {phone}</p>
        <Input
          name="token"
          inputMode="numeric"
          placeholder="קוד מה-SMS"
          autoComplete="one-time-code"
          required
        />
        {verifyState.error && (
          <p className="text-danger text-sm">{verifyState.error}</p>
        )}
        <Button type="submit" disabled={verifying}>
          {verifying ? "מאמת…" : "כניסה"}
        </Button>
      </form>
    );
  }

  return (
    <form action={sendAction} className="flex flex-col gap-4">
      <Input
        name="phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        inputMode="tel"
        placeholder="טלפון — למשל 050-1234567"
        autoComplete="tel"
        required
      />
      {sendState.error && (
        <p className="text-danger text-sm">{sendState.error}</p>
      )}
      <Button type="submit" disabled={sending}>
        {sending ? "שולח…" : "שליחת קוד"}
      </Button>
    </form>
  );
}
