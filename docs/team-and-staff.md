# צוות ומשתמשים (Team & Staff)

> ניהול משתמשי-צוות של המועדון + זרימות התחברות. **Owner בלבד** מנהל צוות.
> קשור: `docs/rbac-and-auth.md` (מפת תפקידים×הרשאות, החלטות התחברות).

## מטרה
ה-Owner מזמין אנשי צוות (גזבר/ית, מאמן, וכו'), נותן להם תפקיד, ומנהל אותם (שינוי role, השבתה, הסרה). התחברות במייל+סיסמה או SMS OTP.

## מודל נתונים
טבלת `public.users` (קיימת): `id` (=auth.users.id), `club_id`, `email`, `full_name`, `role_id → roles`, `person_type` (`coach`/`staff_member`), `person_id`, `status` (`active`/`inactive`), `deleted_at`.

## מסך `/team` (feature `staff`)
נגיש רק ל-`users.manage` (Owner). מפנה ל-`/` למי שאין לו.
- **DataTable** של הצוות: שם · אימייל · תפקיד · סטטוס (חיפוש + פילטרים).
- **הזמנת משתמש** — שם, אימייל, טלפון (אופציונלי ל-SMS), תפקיד, וקישור לכרטיס מאמן (אופציונלי).
- **עורך משתמש** (מודאל): שינוי role · **קישור לכרטיס מאמן** · הפעלה/השבתה · **הסרה**.
- **self-guard:** אי-אפשר לשנות role/סטטוס או להסיר את המשתמש של עצמך.

## Actions (`src/features/staff/actions.ts`) — כולם `users.manage`
- `inviteStaffAction` — יוצר auth user דרך **Admin API** (`adminCreateAuthUser`, service role, server-only) עם `app_metadata.club_id` (+ טלפון `phone_confirm` אם ניתן), משייך role, ומחזיר **סיסמה זמנית חד-פעמית**. **פיצוי:** אם ה-insert ל-`users` נכשל — מוחק את חשבון האימות (`adminDeleteAuthUser`).
- `changeStaffRoleAction` · `setStaffStatusAction` · `removeStaffAction` (soft-delete שורה + מחיקת auth user) · `linkStaffCoachAction` (person_type/person_id, מאמת שכרטיס המאמן שייך למועדון).

## התחברות (`src/features/tenant-auth`)
- **מייל + סיסמה** (`signInTenant`) ו-**SMS OTP** (`sendPhoneOtp`/`verifyPhoneOtp`, `shouldCreateUser:false` — רק מוזמנים). שתי השיטות על אותו חשבון → אותו `club_id`/role.
- **איפוס סיסמה עם SMS:** כניסה ב-OTP → `/set-password` (`updatePasswordAction`).
- **מסך התחברות:** split-screen ספורטיבי, טאבים מייל/SMS, autofill (`one-time-code`), "שנה מספר"/"שליחה חוזרת".
- **השבתה אפקטיבית:** `getCurrentUser` חוסם `status != active` / `deleted_at`; `requireUser` מבחין בין "לא מחובר" ל"הושבת" → `/login?reason=disabled` עם הודעה.

## אבטחה
- service role key (`SUPABASE_SECRET_KEY`) — server-only בלבד, לעולם לא בקליינט/לא `NEXT_PUBLIC`.
- Twilio SMS — מוגדר ב-Supabase Dashboard (לא בריפו). ראה `docs/rbac-and-auth.md` §9.
- נרמול טלפון ישראלי: `src/lib/phone.ts` (E.164 / +972).

## קבצים
`src/features/staff/`: `types.ts`, `queries.ts`, `actions.ts`, `index.ts`, `invite-staff-form.tsx`, `staff-list.tsx`, `staff-editor.tsx`.
`src/lib/supabase/admin.ts` (Admin API), `src/lib/phone.ts`.
התחברות: `src/features/tenant-auth/{actions,queries,permissions}.ts`, `src/app/(tenant)/tenant/login/*`, `.../set-password/*`.

## פתוח / רחבות עתידיות
- **עדכון/הוספת טלפון למשתמש קיים** (כדי שגם ל-Owner יהיה מייל+SMS).
- **כפיית החלפת סיסמה בכניסה ראשונה** (הסיסמה הזמנית עדיין תקפה עד החלפה יזומה).
- הזמנה במייל אוטומטית (כשיוגדר SMTP) — במקום סיסמה זמנית ידנית.
- audit log גלוי לפעולות צוות/הרשאות.
