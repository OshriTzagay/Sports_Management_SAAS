# Deployment & Go-Live — העלאה לאוויר, אבטחה ו-Ops

> מסמך תפעולי להעלאת ה-MVP לאוויר. ארכיטקטורה שנבחרה:
> **Vercel** (אפליקציית Next.js) · **Supabase** (DB/Auth/Storage מנוהל) · **Droplet** (גיבוי חיצוני + staging).
> checklist מתומצת: `roadmap.md` → Phase 5.

---

## 1. ארכיטקטורת ארוח

| רכיב | היכן | אחריות |
|---|---|---|
| אפליקציה (Next.js) | **Vercel** | deploy אוטומטי מ-`main`, HTTPS, סקייל, דומיינים, preview |
| DB / Auth / Storage | **Supabase** (Pro) | Postgres מנוהל, גיבויים+PITR, RLS, Auth, אחסון לוגואים |
| גיבוי חיצוני + staging | **Droplet (DigitalOcean)** | `pg_dump` יומי off-site, סביבת בדיקות |

**למה:** מנהלים את ה-DevOps במקומנו (SSL, סקייל, גיבויים) → מתמקדים במוצר. ה-Droplet נותן הגנת-עומק (גיבוי off-site) בלי להיות נקודת-כשל של האפליקציה.

---

## 2. משתני סביבה (Vercel)

כל הסודות **רק** ב-Vercel Project Settings → Environment Variables (לעולם לא בריפו). נדרשים:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (בטוחים לצד לקוח)
- `SUPABASE_SECRET_KEY` (service role — **server-only**, אף פעם לא `NEXT_PUBLIC`)
- `SUPABASE_DB_URL`, `SUPABASE_JWKS_URL`
- (Batch 4) פרטי Tranzila: terminal + notify password — server-only
- הפרדה: ערכי **Production** מול **Preview/Staging** (Supabase project נפרד ל-staging).

---

## 3. אונבורדינג מועדון (בקליקים + דומיין)

מנגנון ה-provisioning כבר בנוי (`provisionClub`). ל-go-live:
1. **Wildcard DNS:** רשומת `*.yourdomain.com` → Vercel. Vercel מנפיק **wildcard SSL** אוטומטית.
2. מועדון חדש = יצירה ב-Control Plane → זמין מיד ב-`slug.yourdomain.com` (ה-middleware כבר מנתב subdomain → tenant).
3. **אימות בפרוד:** ודא שה-subdomain rewrite עובד (בדיקת mydomain vs `slug.mydomain`).
4. **דומיינים מותאמים פר-מועדון** (`club-domain.co.il`) — שדרוג עתידי: Vercel Domains API + אימות בעלות + הוספת `custom_domain` לטבלת `clubs`.

---

## 4. אבטחה — לפני go-live (קריטי)

- [ ] **RLS audit** — שאילתה שמוודאת `rowsecurity=true` על כל טבלה ב-`public`; אין טבלה חשופה.
- [ ] **Security headers** ב-`next.config`: `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, CSP.
- [ ] **Rate limiting** על endpoints רגישים: login, OTP, webhook, יצירת תשלום (Vercel Edge / upstash / middleware).
- [ ] **Webhook security** (Batch 4): אימות חתימה + `webhook_log` (idempotency) לפני עיבוד.
- [ ] **Auth hardening** (Supabase): מדיניות סיסמה, rate-limit ל-OTP, ניתוק phone signups.
- [ ] **תלויות:** `pnpm audit` שוטף; עדכוני אבטחה.
- [ ] אין סודות בריפו (`.env*` ב-gitignore — ✓). סבב סודות תקופתי.

---

## 5. גיבויים וזמינות (קריטי לאפליקציית כסף)

- [ ] **Supabase PITR** מופעל (Pro) — שחזור לכל נקודת-זמן.
- [ ] **גיבוי off-site:** cron יומי על ה-Droplet שמריץ `pg_dump` (דרך session pooler) → אחסון עם retention (למשל 30 יום). הגנת-עומק מעבר ל-Supabase.
- [ ] **בדיקת שחזור** — לשחזר גיבוי לסביבת test ולוודא שהוא תקין. *גיבוי שלא נבדק = לא גיבוי.*
- [ ] **Uptime monitor** (UptimeRobot/Better Uptime) על health endpoint.
- [ ] **Error tracking** (Sentry) — client + server.
- [ ] **Logging** מובנה + התראות על 5xx / webhook כושל / כשל תשלום.

---

## 6. CI/CD וסביבות

- [ ] **CI (GitHub Actions):** על כל PR — `pnpm typecheck && pnpm lint && pnpm build` + הרצת בדיקות ה-DB (`supabase/tests/*`) מול DB בדיקה.
- [ ] **Preview deploys** אוטומטיים ל-PR (Vercel).
- [ ] **Staging:** Supabase project נפרד + Vercel preview branch. מיגרציות → staging → prod.
- [ ] **משמעת מיגרציות:** לעולם לא לערוך מיגרציה שכבר הורצה; רק להוסיף חדשה.

---

## 7. Runbook (תפעול שוטף)

- **פתיחת מועדון:** Control Plane → יצירת מועדון → מסירת פרטי כניסה למנהל.
- **סבב סוד:** עדכון ב-Vercel env → redeploy.
- **שחזור גיבוי:** Supabase PITR (או pg_dump מה-Droplet) → סביבת test → אימות → פרוד.
- **מיגרציה חדשה:** staging → אימות → prod (session pooler, ראה memory `supabase-db-workflow`).

---

## מה קריטי לעשות מוקדם (זול עכשיו, יקר בדיעבד)
1. **staging + CI** — תופס רגרסיות לפני שהן מגיעות ללקוחות.
2. **RLS audit + security headers** — סגירת חורים לפני חשיפה.
3. **גיבויים + בדיקת שחזור** — לפני שיש כסף אמיתי במערכת.
4. **error/uptime monitoring** — לדעת על תקלה לפני שהלקוח מדווח.
5. **משמעת מיגרציות + הפרדת סביבות** — למנוע "שברתי את הפרוד".
