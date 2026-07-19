# RBAC והתחברות — מסמך תכנון וסטטוס

> מסמך חי. נקרא לפני כל עבודה על משתמשים/הרשאות/התחברות.
> מקורות קשורים: `CLAUDE.md` (כללי ברזל), `club-saas-spec.md` (מפרט מלא), `roadmap.md`.
> נכתב לאחר אישור מיפוי התפקידים וגישת ההתחברות (יולי 2026).

---

## 1. שני עולמות משתמשים (כלל ברזל #9 — קיים ועובד)

| | Control Plane (הפלטפורמה שלי) | Tenant (מועדונים) |
|---|---|---|
| טבלה | `platform_users` | `public.users` |
| התחברות | Supabase Auth, `app_metadata.is_platform=true` | Supabase Auth, `app_metadata.club_id` |
| תפקידים | `role`: `admin` / `support` | `role_id` → `public.roles` (פר-מועדון) |
| בידוד | רואה הכל | RLS ל-`club_id` יחיד |

`getCurrentUser()` (`src/features/tenant-auth/queries.ts`) דוחה מפורשות משתמש עם `is_platform=true` מכניסה לאזור המועדון. שני העולמות **לעולם לא מתערבבים**.

---

## 2. קטלוג ההרשאות (16 — כבר seeded ב-DB)

מוגדר ב-`supabase/migrations/20260618000003_seed_permissions.sql`. גלובלי, לא tenant-scoped.

| Key | תיאור |
|---|---|
| `seasons.view` / `seasons.manage` | צפייה / ניהול עונות |
| `teams.view` / `teams.manage` | צפייה / ניהול קבוצות |
| `players.view` / `players.manage` | צפייה / ניהול שחקנים ושיבוצים |
| `coaches.view` / `coaches.manage` | צפייה / ניהול מאמנים ושיוכים |
| `contacts.view` / `contacts.manage` | צפייה / ניהול אנשי קשר |
| `payments.view` / `payments.charge` | צפייה בחיובים / יצירת חיובים וקישורי תשלום |
| `reports.view` | צפייה בדוחות |
| `users.view` / `users.manage` | צפייה / ניהול משתמשי צוות ותפקידים |
| `settings.manage` | עריכת הגדרות המועדון ו-branding |

---

## 3. מפת תפקידים × הרשאות (מאושר)

**רמה:** ניהול = view+manage · צפייה = view בלבד · — = אין גישה.

| תחום | 👑 Owner (מנהל מועדון) | 💰 גזבר/ית | 🏃 מאמן |
|---|:---:|:---:|:---:|
| עונות | ניהול | צפייה | צפייה |
| קבוצות | ניהול | צפייה | צפייה |
| שחקנים | ניהול | צפייה | צפייה |
| מאמנים | ניהול | צפייה | צפייה |
| אנשי קשר | ניהול | ניהול | צפייה |
| תשלומים | ניהול | ניהול | — |
| דוחות | צפייה | צפייה | — |
| משתמשי צוות | ניהול | — | — |
| הגדרות/branding | ניהול | — | — |

**Owner = כל 16 ההרשאות** (כולל דוחות ושינוי roles של אחרים דרך `users.manage`).

**רשימות הרשאות מפורשות:**
- **Owner** — כל 16.
- **גזבר/ית** — `seasons.view`, `teams.view`, `players.view`, `coaches.view`, `contacts.view`, `contacts.manage`, `payments.view`, `payments.charge`, `reports.view`. (9)
- **מאמן** — `seasons.view`, `teams.view`, `players.view`, `coaches.view`, `contacts.view`. (5)

**היגיון:** הגזבר/ית רואה הכל אבל נוגע רק בכסף + אנשי-קשר (איש הקשר לחיוב שייך לו). המאמן רואה את הזירה התפעולית שלו בלבד. רק Owner מנהל צוות והגדרות.

שלושת התפקידים = `is_system=true` (מובנים, לא נמחקים). ה-Owner יכול **לשנות role** של משתמשים אחרים (`users.manage`).

---

## 4. ניהול משתמשים — אדמין (Owner) בלבד

זרימת הזמנה:

```
Owner → מסך "צוות" → "+ הזמנת משתמש"
   מזין: שם מלא, אימייל, תפקיד (Owner/גזבר/מאמן), [טלפון אופציונלי]
        ↓ server action (בודק users.manage)
   Supabase Admin API יוצר auth user + מזריק app_metadata.club_id + שולח מייל הזמנה
   נוצרת שורה ב-public.users עם role_id + club_id
        ↓
   המשתמש פותח לינק → מגדיר סיסמה → נכנס עם ההרשאות שלו
```

Owner יכול גם **לשנות role** ו**להשבית** (status=inactive / soft-delete) משתמש קיים.

**נקודה קריטית:** יצירת auth user והזרקת `club_id` ל-JWT מחייבות **service role key** (secret, server-only) — עובר דרך server action/API route בלבד. לעולם לא מהקליינט.

---

## 5. התחברות — הגישה שנבחרה

**עמוד שדרה: אימייל (הזמנה + סיסמה).** מתלבש על מודל "אדמין יוצר משתמשים", חינמי, מובנה ב-Supabase (`inviteUserByEmail` / `generateLink`).

**SMS OTP: כבה נוספת/אופציה — לא ראשונה.** עולה כסף + דורש ספק (Twilio/MessageBird/019). ייכנס כאופציית התחברות/2FA ברגע שייבחר ספק ותקציב. **החלטת ספק SMS — פתוחה (TODO).**

---

## 6. סדר מימוש (checklist)

- [x] **מיגרציה:** seed 3 תפקידי מערכת + מיפוי הרשאות לכל מועדון; משולב ב-`provision_club`. *(20260713000001 · `ensure_system_roles` · backfilled · test `system_roles.sql`)*
- [x] **`requirePermission(key)`** בשכבת `tenant-auth` (טוען role→permissions; default-deny). *(`permissions.ts` — נותר לעטוף את ה-actions עצמם.)*
- [ ] **סינון UI לפי הרשאה** — הסתרת כפתורי "+"/פעולות/פריטי ניווט שאין להם הרשאה. (helper `can(key)` צד-שרת + צד-לקוח.)
- [ ] **מסך ניהול צוות** — רשימת משתמשים (DataTable), שינוי role, השבתה.
- [ ] **זרימת הזמנה במייל** — Admin API (service role) ב-API route מאובטח.
- [ ] **מסך התחברות משודרג** + עמוד הגדרת סיסמה מהזמנה.
- [ ] **audit log** לפעולות צוות/הרשאות (טבלת `audit_logs` כבר קיימת).
- [ ] (אחר-כך) **SMS OTP** כאופציית התחברות.

---

## 7. מצב נוכחי (מה נאכף היום)

- **אימות בלבד, לא הרשאה.** כל action בודק רק `requireUser()`. `role_id` נטען אך לא נבדק.
- אין `requirePermission`, אין תפקידי ברירת-מחדל מוזרעים, אין סינון UI לפי הרשאה.
- בפועל: כל מחובר למועדון יכול לעשות הכל **באותו מועדון**. הבידוד היחיד הפעיל = בין-מועדוני (RLS על `club_id`).
- זה תקין כל עוד יש משתמש אחד למועדון. **לפני multi-staff go-live — לממש את section 6.**

---

## 8. שיפורים ורחבות עתידיות

- **תפקידים נוספים:** מזכיר/ה (ניהול תפעולי בלי כסף/צוות), מנהל/ת מקצועי/ת (ניהול קבוצות/מאמנים/שחקנים). = עוד שורות בטבלה, ללא שינוי ארכיטקטורה.
- **תפקידים מותאמים אישית:** Owner יוצר role חדש ובוחר הרשאות (`is_system=false`). התשתית (`roles`+`role_permissions`) כבר תומכת.
- **flow מלא למאמן** (Phase נפרד): יצירת אימון/מפגש, הוספת שחקנים לאימון, נוכחות, יומן. ידרוש ישויות חדשות (practices/attendance) + הרשאות חדשות (`practices.*`).
- **2FA/SMS OTP** כשכבה שנייה.
- **הרשאות ברמת קבוצה** (scoped): מאמן רואה רק את הקבוצות שלו, לא כל המועדון. שדרוג ל-`requirePermission` עם scope.
- **audit log גלוי** למשתמש (מי עשה מה ומתי).

---

*עדכן מסמך זה בכל שינוי במודל ההרשאות/התפקידים/ההתחברות.*
