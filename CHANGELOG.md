# CHANGELOG

יומן שינויים — רשומה לכל commit (החדש למעלה). תאריכים מוחלטים.

## Phase 1 — ליבה תפעולית (Tenant)

### 2026-06-19

- **`fix(ui): stale data after mutations + layout/UX improvements`** — תיקון
  שורשי: `revalidatePath` השתמש בנתיבי המשתמש (`/teams`...) במקום בנתיב המרונדר
  (`/tenant/...`) בגלל ה-rewrite — שינויים נשמרו אך הופיעו רק אחרי רענון. עכשיו
  `revalidatePath("/tenant","layout")`. + `router.refresh()` למיתוג/לוגו (החלה
  מיידית), אזור תוכן רחב (עד 1600px), **סייד-בר מתקפל** (נשמר ב-localStorage),
  **חיפוש** בטבלת השחקנים, ותצוגה מקדימה ללוגו הנבחר.
- **`feat(ui): create-in-modal flows + loaders + micro-interactions`** — רכיב
  `FormDialog` (מודאל ליצירה, נסגר אוטומטית בהצלחה); יצירת עונה/קבוצה/שחקן/מאמן
  עברה לכפתור "+" שפותח מודאל (במקום טופס מתחת לטבלה); רכיב `Spinner` + loader
  ברמת ה-route; אנימציית פתיחת מודאל + לחיצת כפתור. *(עריכה-במודאל — pass הבא)*
- **`feat(branding): logo upload + designed settings + apply loader`** — Supabase
  Storage (bucket ציבורי + RLS לפי תיקיית מועדון, PNG/JPG עד 1MB); עמוד הגדרות
  מעוצב: העלאת לוגו עם תצוגה, swatches + color-picker + תצוגה מקדימה חיה, בורר
  ערכת נושא; **loader על כל המסך** בזמן החלת מיתוג; לוגו בסייד-בר.
- **`feat(branding): runtime club colors + display name`** — טבלת `club_branding`;
  feature `branding` (getClubBranding, update action); צבע מותג יחיד נגזר לסקאלת
  primary מלאה ב-color-mix ונטען כ-CSS variables על שורש אזור המועדון בזמן ריצה;
  שם תצוגה בסייד-בר; עמוד הגדרות עם color-picker. בדיקת בידוד עוברת. *(העלאת לוגו
  — דורש Supabase Storage + סניטציית SVG, נדחה להחלטה)*
- **`feat(dashboard): club metrics`** — feature `dashboard` עם מטריקות מצרפיות
  (count יעיל ב-head) + רכיב `MetricCard` (design-system); עמוד הבית של המועדון
  הפך לדשבורד: שחקנים פעילים, קבוצות בעונה, מאמנים פעילים, שחקנים ללא שיבוץ.
- **`feat(seasons): season rollover`** — RPC `rollover_season` (SECURITY DEFINER,
  club-scoped) שמעתיק קבוצות + שיבוצי שחקנים פעילים + שיוכי מאמנים פעילים מעונת
  מקור לעונת יעד ריקה (מיפוי לפי שם קבוצה). אופציה "העתקת מבנה מעונה" בטופס יצירת
  עונה. בדיקה: העתקה + החרגת שחקן שעזב + חסימת יעד לא-ריק (עוברת).
- **`feat(coaches): season team assignment`** — טבלת `team_coaches` (שיוך עונתי
  רב-ל-רב + תפקיד ראשי/עוזר/שוערים, מניעת כפילות); שיוך/הסרה ממסך המאמנים בעונה
  הפעילה (badges + הוספה). בדיקה: רב-קבוצות + כפילות חסומה + בידוד (עוברת).
- **`feat(coaches): coach identity`** — טבלת `coaches` (זהות, scope club_id,
  הסמכות + תוקף רישיון); feature `coaches` (listCoaches, create + שינוי סטטוס);
  טבלה ב-CMS עם הדגשת רישיון שפג תוקף + nav. בדיקת בידוד עוברת. *(שיוך עונתי
  לקבוצה — הבא)*
- **`feat(players): season team assignment`** — טבלת `team_players` (שיוך עונתי
  club_id+season_id, שיבוץ יחיד לשחקן בעונה); שיבוץ/הסרה ממסך השחקנים בעונה
  הפעילה (select). משלים את מודל זהות↔שיוך. בדיקה: שיבוץ יחיד + בידוד (עוברת).
- **`feat(players): player identity + statuses`** — טבלת `players` (זהות קבועה,
  scope club_id, ת.ז. ייחודי למועדון); feature `players` (listPlayers, create +
  שינוי סטטוס פעיל/לא-פעיל/עזב — "עזב"=סטטוס ולא מחיקה); טבלה ב-CMS + nav. בדיקת
  בידוד players (קריאה+כתיבה) עוברת. *(שיבוץ לקבוצה בעונה — הבא)*
- **`feat(ui): CMS shell — sidebar nav + data tables`** — מעטפת CMS לאזור
  המועדון: סייד-בר ניווט (RTL, אייקוני lucide, קישור פעיל, עונה פעילה, משתמש+
  התנתקות) ב-route group `(app)` עם שער כניסה מרוכז; רכיב `Table` מקצועי; המרת
  הרשימות (עונות, קבוצות, מועדונים) לטבלאות.
- **`feat(teams): teams per season`** — טבלת `teams` (scope club_id+season_id,
  RLS, unique שם-לעונה); feature `teams` (listTeams, create/soft-delete actions);
  UI בעונה הפעילה + nav. בדיקת בידוד teams (קריאה+כתיבה) עוברת.
- **`feat(ui): season status clarity + dialog`** — רכיב `Dialog` נגיש (מבוסס
  `<dialog>` נייטיב); דיאלוג הסבר "מה זה פעילה/סגורה"; תצוגת עונה ברורה יותר
  (הדגשת העונה הפעילה, סטטוס "לא פעילה", תאריכים).
- **`feat(seasons): seasons CRUD + activation`** — feature `seasons`: רשימה,
  יצירה, הפעלה (RPC `set_active_season` — עונה פעילה אחת למועדון), סגירה
  (read-only). פילטר עונה פעילה (`getActiveSeason`). UI באזור המועדון + nav.
  בדיקה: החלפת עונה פעילה + בידוד בין מועדונים (עוברת).
- **`feat(tenant): tenant auth`** — feature `tenant-auth`: `getCurrentUser`/
  `requireUser` (קורא club_id מה-claim, default-deny), server actions signIn/
  signOut, עמוד login ודף בית מוגן לאזור המועדון. אומת מקצה לקצה: provisioning
  דרך RPC → tenant login עם claim תואם → RLS מבודד למועדון. נזרע מועדון דמו.

## Phase 0 — תשתית

### 2026-06-18

- **`feat(clubs): suspend/activate club`** — RPC `set_club_status` (SECURITY
  DEFINER, platform-only, audit על השינוי) + כפתור השעיה/הפעלה ברשימת המועדונים.
  בדיקה: עדכון+audit + חסימת משתמש שאינו פלטפורמה (עוברת). **סוף Phase 0.**
- **`feat(clubs): tenant provisioning`** — RPC טרנזקציוני `provision_club`
  (SECURITY DEFINER + בדיקת is_platform, default-deny) שמקים club + role "מנהל
  מועדון" עם כל ההרשאות + משתמש מנהל + עונה פעילה + audit; admin helpers (REST,
  server-only) ליצירת/מחיקת משתמש אימות; feature `clubs` (provisioning/queries/
  actions/UI) — רשימת מועדונים וטופס יצירה ב-Control Plane. בדיקה: happy path +
  חסימת משתמש שאינו פלטפורמה (עוברת).
- **`docs: features/ README + CHANGELOG`** (`a11cddc`) — תיעוד מוסכמת ה-features
  ויומן השינויים.
- **`feat(control-plane): platform auth`** (`ff1ab68`) — feature `platform-auth`:
  `getPlatformUser`/`requirePlatformUser` (default-deny), server actions
  `signIn`/`signOut` עם ולידציית Zod, עמוד login ודף מוגן. סקריפט bootstrap
  למשתמש הפלטפורמה הראשון. אומת: login + RLS read מקצה לקצה.
- **`feat: subdomain-based area separation`** (`4718e64`) — `resolveArea()` +
  middleware שעושה rewrite לפי subdomain (admin.* / app.*) ומרענן סשן; layouts
  נפרדים ל-(control-plane) ו-(tenant); נחיתה ניטרלית. אומת חי בשלושה hosts.
- **`chore: track .env.local.example`** (`91c86de`) — תיקון כלל ignore כדי לעקוב
  אחרי קובץ הדוגמה (ללא הסוד עצמו).
- **`feat(db): Supabase wiring + Phase 0 schema`** (`12443bc`) — env validation +
  helpers (server/client/middleware); מיגרציות: platform_users, clubs, seasons,
  RBAC, audit_logs; RLS על כל הטבלאות לפי JWT club_id (default-deny); בדיקת בידוד
  עוברת.
- **`feat(ui): design-system primitives`** (`e2b415f`) — design tokens כ-CSS
  variables (brand ניתן לדריסה בזמן ריצה) + רכיבי Button/Input/Card/Badge
  מותאמים ל-design-system ו-RTL.
- **`chore: scaffold Next.js app`** (`3c349ac`) — Next.js 16 (App Router, TS
  strict), Tailwind v4, ESLint/Prettier, RTL + Heebo, מבנה feature-based.
