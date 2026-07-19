import { CreditCard, ShieldCheck, Trophy, Users } from "lucide-react";

import { TenantLoginForm } from "./login-form";

const FEATURES = [
  { icon: Users, text: "שחקנים, קבוצות ומאמנים במקום אחד" },
  { icon: CreditCard, text: "תשלומים, חיובים וחשבוניות" },
  { icon: ShieldCheck, text: "תפקידים והרשאות לכל אנשי הצוות" },
];

export default async function TenantLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <div className="flex min-h-full flex-1">
      {/* פאנל מותג — מוסתר במסכים קטנים */}
      <aside className="from-primary-500 to-primary-700 relative hidden w-[45%] flex-col justify-between overflow-hidden bg-gradient-to-br p-10 text-white lg:flex">
        <div className="pointer-events-none absolute -end-16 -top-24 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -start-10 -bottom-28 size-96 rounded-full bg-black/10 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Trophy className="size-5" />
          </div>
          <span className="text-lg font-bold">SportClub</span>
        </div>

        <div className="relative flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl leading-tight font-bold">
              מערכת ניהול מועדוני הספורט שלך
            </h2>
            <p className="max-w-sm text-white/80">
              כל התפעול של המועדון במקום אחד — מהרשמת שחקנים ועד תשלומים
              והרשאות.
            </p>
          </div>
          <ul className="flex flex-col gap-3">
            {FEATURES.map((f) => (
              <li
                key={f.text}
                className="flex items-center gap-3 text-sm text-white/90"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <f.icon className="size-4" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/60">
          © {new Date().getFullYear()} SportClub
        </p>
      </aside>

      {/* פאנל טופס */}
      <main className="bg-bg flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="bg-primary-500 flex size-12 items-center justify-center rounded-2xl text-white shadow-md lg:hidden">
              <Trophy className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-text-primary text-2xl font-bold">
                ברוכים הבאים 👋
              </h1>
              <p className="text-text-muted text-sm">
                התחברות לאזור הניהול של המועדון
              </p>
            </div>
          </div>

          {reason === "disabled" && (
            <div className="border-danger/30 bg-danger-bg text-danger-text rounded-lg border px-4 py-3 text-sm">
              החשבון שלך הושבת על ידי מנהל המועדון. לפרטים ולחידוש הגישה — פנה
              למנהל.
            </div>
          )}

          <TenantLoginForm />
        </div>
      </main>
    </div>
  );
}
