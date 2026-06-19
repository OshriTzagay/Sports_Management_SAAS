# CHANGELOG

יומן שינויים — רשומה לכל commit (החדש למעלה). תאריכים מוחלטים.

## Phase 1 — ליבה תפעולית (Tenant)

### 2026-06-19

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
