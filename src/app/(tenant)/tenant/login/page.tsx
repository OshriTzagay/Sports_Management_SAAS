import { Trophy } from "lucide-react";

import { TenantLoginForm } from "./login-form";

export default function TenantLoginPage() {
  return (
    <div className="from-primary-50/60 to-bg relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-b p-6">
      {/* עיטורי רקע רכים */}
      <div className="bg-primary-300/20 pointer-events-none absolute -start-24 -top-24 size-72 rounded-full blur-3xl" />
      <div className="bg-primary-500/10 pointer-events-none absolute -end-24 -bottom-28 size-80 rounded-full blur-3xl" />

      <div className="border-border bg-bg-surface relative w-full max-w-sm overflow-hidden rounded-2xl border shadow-xl">
        <div className="from-primary-500 to-primary-700 flex flex-col items-center gap-2 bg-gradient-to-br px-6 py-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Trophy className="size-7 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white">מערכת ניהול המועדון</h1>
          <p className="text-xs text-white/80">התחברות לאזור הניהול</p>
        </div>
        <div className="p-6">
          <TenantLoginForm />
        </div>
      </div>
    </div>
  );
}
