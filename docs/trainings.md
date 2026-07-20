# אימונים (Trainings) — feature המאמנים

> feature לניהול אימונים ונוכחות, mobile-first. **בסיס לתשלום למאמן** — לכן מדויק ומלא.
> קשור: `docs/rbac-and-auth.md` (הרשאות/תפקידים), `docs/team-and-staff.md` (קישור מאמן↔משתמש).

## מטרה
מאמן בשטח יוצר אימון לקבוצה שלו, מסמן נוכחות, ומתחיל/מסיים. כל הנתונים זורמים למנהל/גזבר לתשלום מדויק: מאמן · קבוצה · עונה · מועד · שעת התחלה/סיום · **משך** · **כמה הגיעו מתוך כמה** · הערות.

## מודל נתונים
מיגרציה: `supabase/migrations/20260713000002_trainings.sql`. בדיקה: `supabase/tests/trainings_isolation.sql`.

**`training_sessions`** — `club_id`, `season_id` (עונתי), `team_id`, `coach_id`, `title?`, `scheduled_at`, `status` (`scheduled`→`in_progress`→`completed` / `cancelled`), `started_at?`, `ended_at?`, `notes?`, `created_by?`. משך = `ended_at − started_at`.

**`training_attendance`** — `club_id`, `training_session_id`, `player_id`, `status` (`present`/`absent`). `unique(training_session_id, player_id)`. נוצרות **בהתחלת האימון** (snapshot של הסגל, כולם `present`), ננעלות בסיום.

RLS על שתיהן: `club_id = current_club_id()` (בידוד בין-מועדוני).

## הרשאות וסקופ
- `trainings.view` / `trainings.manage`. Owner=הכל · גזבר/ית=view · מאמן=view+manage.
- **קישור מאמן↔משתמש:** `users.person_type='coach'` + `person_id → coaches.id`. `getMyCoachId()` מחזיר את כרטיס המאמן של המשתמש המחובר.
- **סקופ (דיוק תשלום):** מאמן יכול ליצור/לנהל אימון **רק לקבוצה שהוא משויך אליה** (`team_coaches`), ו-`coach_id` = כרטיס המאמן שלו.
- **נעילה:** אימון שהושלם נעול למאמן — רק **Owner** (`users.manage`) יכול לתקן. נאכף ב-`authorizeTrainingEdit`.

## זרימה
1. **יצירה** (`createTrainingAction`) — מאמן בוחר קבוצה (מהמשויכות) + מועד (עכשיו או מתוזמן) → `scheduled`.
2. **התחלה** (`startTrainingAction`) — snapshot של הסגל כ-`present`, מעבר ל-`in_progress`.
3. **נוכחות** (`setAttendanceAction`) — toggle `present`/`absent` לכל שחקן. אופטימי, לא-חוסם, spinner פר-שורה.
4. **סיום** (`endTrainingAction`) — פופ-אפ הערות (אירוע חריג) → `completed` + `ended_at`, ננעל.
5. **ביטול** (`cancelTrainingAction`) — למתוזמן/מתקיים.

## מסכים
- **`/trainings`** — מסך המאמן: אימוני העונה (כרטיסי "X/Y" נוכחות) + יצירה. מופיע בסייד-בר רק למאמן מקושר (`isCoach`).
- **`/trainings/[id]`** — עמוד אימון: התחלה → נוכחות עם פס התקדמות → סיום; `completed` = read-only (משך, הערות, נוכחות). skeleton בטעינה.
- **`/coaches/[id]`** — מבט המנהל: `CoachTrainingsTable` (DataTable עם חיפוש/פילטר/מיון/גלילה) + כרטיסי סיכום (סה"כ אימונים / הושלמו / סה"כ שעות). גזבר/ית רואה גם ב-read-only.

## קבצים
`src/features/trainings/`: `types.ts`, `queries.ts` (getMyCoachId, listCoachTeams, listTrainingsForCoach, listSeasonTrainings, listTrainingsByCoach, getTraining, listAttendance), `actions.ts`, `index.ts`, `create-training-form.tsx`, `training-detail.tsx`.
`src/features/coaches/coach-trainings-table.tsx`.

## ביצועים
`authorizeTrainingEdit` מריץ perms/session/coach ב-`Promise.all` (במקום ~6 קריאות סדרתיות). סימון נוכחות פר-שורה ולא-חוסם (אופטימי + revert).

## בסיס תשלום (מאושר)
לפי **אימון** כרגע, אבל **שעות נאספות** (start/end). נוכחות בינארית (present/absent). ראה החלטות ב-`docs/rbac-and-auth.md`.

## פתוח / רחבות עתידיות
- **עריכת אימון מתוזמן** (תאריך/קבוצה) לפני התחלה.
- מסך ל-**Owner לפתוח מחדש/לתקן** אימון שהושלם (ה-action כבר מתיר).
- חישוב תשלום בפועל מנתוני האימונים (Phase תשלומים).
