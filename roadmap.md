# Roadmap — תוכנית ביצוע

> תוכנית עבודה מפורקת למשימות. עבוד **לפי הסדר**, משימה אחר משימה. אל תקפוץ קדימה.
> סמן ✅ כל משימה שהושלמה (לפי Definition of Done ב-CLAUDE.md). הצג לי את התוכנית לכל feature לפני שמתחיל לכתוב.
> הקשר מלא: `club-saas-spec.md`. כללי קוד: `CLAUDE.md`. עיצוב: `design-system.md`.

## שני אזורים, פרויקט אחד (חשוב להבין לפני שמתחילים)

המערכת היא **פרויקט קוד אחד** (DB משותף, מודלים משותפים) עם **שני אזורי גישה נפרדים לחלוטין**:

- **Control Plane** (`admin.yourapp.com`) — האזור שלך. auth דרך `platform_users`. יצירת מועדונים, מנויים, דשבורד רוחבי. בעל מועדון לעולם לא נכנס לכאן.
- **Tenant Plane** (`app.yourapp.com`) — האזור של המועדונים. auth דרך `users`. כל בקשה מסוננת ל-`club_id` יחיד דרך RLS.

ההפרדה היא לוגית (אזורים, auth נפרד, RLS) — **לא** שני פרויקטים נפרדים. פיצול לשני פרויקטים היה משכפל DB, מודלים ו-auth = סיוט תחזוקה. הבידוד מושג דרך הארכיטקטורה, לא דרך הפרדת קוד.

---

## Phase 0 — תשתית משותפת + Control Plane בסיסי

**תשתית (משרתת את שני האזורים):**
- [x] הקמת פרויקט Next.js (App Router, TypeScript strict) + Tailwind + תמיכת RTL *(shadcn/ui — צעד הבא)*
- [x] הגדרת ESLint + Prettier, מבנה תיקיות feature-based (ראה CLAUDE.md)
- [x] חיבור Supabase (project, env vars, client) — `.env` ב-gitignore מיד
- [x] הפרדת שני האזורים: routing/subdomain ל-`admin` מול `app`, layouts נפרדים
- [x] סכמת DB ראשונית: `clubs`, `seasons`, `platform_users`, `users`, `roles`, `permissions`, `role_permissions` *(+audit_logs)*
- [x] הפעלת RLS על כל טבלה + policies מבוססות `club_id` (JWT claim)
- [x] בדיקת בידוד: ודא שמשתמש ממועדון א' לא רואה נתוני ב' (בדיקה אוטומטית) — `supabase/tests/rls_isolation.sql`
- [ ] שכבת authorization (default-deny) — middleware שבודק permissions *(session refresh קיים; permission check בהמשך)*
- [x] תשתית: audit_log, soft-delete (deleted_at) ✓ · generated types — *נדחה (דורש Docker או access token)*
- [ ] גיבויים אוטומטיים מופעלים ב-Supabase
- [~] **Observability / Alerting / Rate-limiting** — *נדחה ל-Phase מאוחר (דורש חשבונות חיצוניים: Sentry/uptime). כולל: structured logging, error tracking, health checks, התראות על 5xx/webhook/תשלום, ו-rate limiting על endpoints רגישים.*

**Control Plane (האזור שלך — `admin`):**
- [x] Auth נפרד ל-`platform_users` (login משלך, מנותק מ-auth של המועדונים)
- [x] יצירת מועדון (tenant provisioning): מקים `club` + Club Admin ראשון + עונה ריקה
- [x] רשימת מועדונים: סטטוס, תאריך הקמה *(מספר משתמשים — בהמשך)*
- [x] עריכת/השעיית מועדון

## Phase 1 — ליבה תפעולית (Tenant Plane — `app`)

- [ ] טבלאות: `teams`, `players`, `team_players`, `coaches`, `team_coaches`, `club_branding`
- [x] עונות: יצירה, הפעלה (`is_active`), פילטר עונה גלובלי (ברירת מחדל = עונה פעילה) *(switcher גלובלי — בהמשך)*
- [x] קבוצות: CRUD + קטגוריות גיל
- [ ] שחקנים: CRUD + סטטוסים (פעיל/לא פעיל/עזב) + שיבוץ לקבוצה בעונה
- [ ] מאמנים: CRUD (פרטים, הסמכות, תוקף רישיון) + שיוך עונתי לקבוצה
- [ ] גלגול עונה (Rollover): העתקת מבנה עונה קודמת + קידום לפי גיל (הצעה) + read-only לעונה סגורה
- [ ] Branding: העלאת לוגו (Supabase Storage + סניטציית SVG) + צבעים + שם תצוגה, נטען בזמן ריצה
- [ ] דשבורד מועדון: שחקנים בעונה, התפלגות קבוצות, פעילות אחרונה
- [ ] **CMS UI/UX (סוף Phase 1):** מעטפת CMS מקצועית — **סייד-בר ניווט** (לוגו/מועדון, אייקונים, פילטר עונה), **טבלאות נתונים מקצועיות** לכל הרשימות, מצבי ריק/טעינה, עקביות עם design-system.

## Phase 2 — אנשי קשר ותשלומים (ה"וואו")

- [ ] טבלאות: `contacts`, `player_contacts`, `payment_plans`, `invoices`, `payments`, `webhook_log`, `idempotency_keys`
- [ ] ניהול אנשי קשר + קישור לשחקנים + סימון `is_billing_contact` + ולידציה (קטין חייב איש קשר)
- [ ] מודלי תשלום (`payment_plans`): חד-פעמי + תשלומים
- [ ] יצירת חיוב מהשחקן + קביעת נמען לפי billing contact + אגד חיובי משפחה
- [ ] state machine של חיוב (draft→pending→paid/failed/overdue...) + מעברים מותרים בלבד
- [ ] אינטגרציית סולק (Cardcom/Tranzila/Meshulam): hosted page, יצירת קישור
- [ ] webhook: אימות חתימה + שמירה ל-webhook_log לפני עיבוד + idempotency
- [ ] שליחת קישורי תשלום ב-SMS/מייל (עם branding) דרך שכבת notifications
- [ ] חשבונית + קבלה אוטומטית (שיעור מע"מ נשמר היסטורית)
- [ ] מסך reconciliation לגזבר: מי שילם, מי בפיגור, סכומים פתוחים
- [ ] *(מאוחר יותר, לפי דרישה: מנוי חודשי מתחדש עם token)*

## Phase 3 — הרשאות מתקדמות

- [ ] RBAC מלא עם permissions גרנולריים + roles מותאמים לכל מועדון
- [ ] הזמנת staff במייל (המשתמש מגדיר סיסמה בעצמו)
- [ ] OTP ב-SMS + 2FA אופציונלי לתפקידי כסף
- [ ] Audit log גלוי לאדמין
- [ ] גישת תמיכה מבוקרת מ-Control Plane לתוך מועדון (מתועדת)

## Phase 4 — אנליטיקה ותוספות

- [ ] דוחות: תשלומים, פיגורים, התפלגות שחקנים, מגמות בין עונות
- [ ] דשבורד פלטפורמה מלא (מטריקות עסקיות שלך)
- [ ] פעילויות / לוח אימונים / נוכחות (אם רלוונטי)
- [ ] Subscription billing למודל ה-SaaS שלך + plan limits

---

## כלל זהב
כל phase נותן ערך עצמאי ועובד. אל תתחיל phase לפני שהקודם **עובד ונבדק**. אם משימה גדולה מדי — פרק אותה לתת-משימות לפני שכותב.
