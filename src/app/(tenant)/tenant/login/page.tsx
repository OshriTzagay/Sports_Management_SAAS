import { CreditCard, ShieldCheck, Users, Zap } from "lucide-react";

import { TenantLoginForm } from "./login-form";

const FEATURES = [
  { icon: Users, text: "שחקנים, קבוצות ומאמנים במקום אחד" },
  { icon: CreditCard, text: "תשלומים, חיובים וחשבוניות" },
  { icon: ShieldCheck, text: "תפקידים והרשאות לכל אנשי הצוות" },
];

const GOLD = "#ffd166";

export default async function TenantLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <div className="flex min-h-full flex-1">
      {/* פאנל מותג ספורטיבי — מוסתר במסכים קטנים */}
      <aside
        className="from-primary-500 to-primary-700 relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br p-12 text-white lg:flex"
        style={{
          backgroundImage:
            "linear-gradient(135deg, var(--primary-500), var(--primary-700))",
        }}
      >
        {/* מוטיבים גיאומטריים — פסים אלכסוניים + עיגולי מגרש */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #fff 0 2px, transparent 2px 26px)",
          }}
        />
        <div className="pointer-events-none absolute -end-20 -top-24 size-72 rounded-full border-[20px] border-white/10" />
        <div className="pointer-events-none absolute -start-16 -bottom-32 size-96 rounded-full bg-white/5 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <span
            className="flex size-11 items-center justify-center rounded-2xl bg-white/15 ring-2 backdrop-blur"
            style={{ boxShadow: `inset 0 0 0 2px ${GOLD}33` }}
          >
            <Zap className="size-6" style={{ color: GOLD }} />
          </span>
          <span className="text-xl font-bold tracking-tight">SportClub</span>
        </div>

        <div className="relative flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            <span
              className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: `${GOLD}26`, color: GOLD }}
            >
              <span
                className="size-1.5 animate-pulse rounded-full"
                style={{ background: GOLD }}
              />
              המערכת פעילה
            </span>
            <h2 className="text-4xl leading-[1.15] font-bold">
              נהל את המועדון
              <br />
              <span style={{ color: GOLD }}>כמו אלופים.</span>
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
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <f.icon className="size-4" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/60">
          © {new Date().getFullYear()} SportClub — מערכת ניהול מועדוני ספורט
        </p>
      </aside>

      {/* פאנל טופס */}
      <main className="bg-bg flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="bg-primary-500 flex size-12 items-center justify-center rounded-2xl text-white shadow-md lg:hidden">
              <Zap className="size-6" />
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
