# `features/` — ארגון לפי תחום עסקי (לא לפי סוג טכני)

כל תת-תיקייה כאן היא **feature** — יחידה עצמאית שמרכזת את *כל* מה שקשור לתחום
עסקי אחד: טיפוסים, גישה לנתונים, לוגיקה ו-UI. כך קל למצוא דברים, וכל feature
הוא גבול ברור.

## מבנה פנימי של feature

```
features/<domain>/
  index.ts        ← ה-API הציבורי (barrel). מבחוץ מייבאים רק מכאן.
  types.ts        ← הטיפוסים של התחום.
  queries.ts      ← שכבת data (server-only): קריאות מה-DB. תמיד מסונן ל-club_id.
  actions.ts      ← server actions (mutations) + ולידציית Zod.
  provisioning.ts ← לוגיקת שירות מורכבת (אם יש), server-only.
  *.tsx           ← רכיבי UI של התחום (אופציונלי).
```

## כללים

- **גבול ציבורי:** features אחרים מייבאים רק דרך `index.ts`, לא קבצים פנימיים.
- **כל גישה ל-DB** עוברת דרך `queries.ts` / `provisioning.ts` — לא שאילתות מפוזרות ב-UI.
- **תמיד מסונן ל-`club_id`** (הגנת עומק מעל RLS).
- רכיבי client מייבאים `actions` ישירות (גבול ה-RPC); קוד server-only לא נכנס ל-bundle של הדפדפן.

## ה-features המתוכננים (לפי ה-roadmap)

| feature | תחום | Phase |
|---|---|---|
| `platform-auth` | התחברות Control Plane | 0 ✓ |
| `clubs` | ניהול ו-provisioning של מועדונים | 0 |
| `seasons` | עונות + גלגול עונה | 1 |
| `teams` | קבוצות + קטגוריות גיל | 1 |
| `players` | שחקנים + שיבוצים עונתיים | 1 |
| `coaches` | מאמנים + שיוך עונתי | 1 |
| `contacts` | אנשי קשר (נתונים בלבד) | 2 |
| `payments` | מודלי תשלום, חיובים, סליקה | 2 |
