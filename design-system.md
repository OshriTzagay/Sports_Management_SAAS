# Design System — מערכת ניהול מועדוני ספורט

> מקור אמת יחיד לעיצוב. כל רכיב חדש משתמש ב-tokens האלה — אסור להמציא צבעים/מרווחים ad-hoc.
> הצבעים כאן הם **ברירת המחדל של המערכת**. כל מועדון יכול לדרוס primary/secondary דרך ה-branding (סעיף 5.1 באפיון), אז בנה את ה-UI כך שצבעי המותג נטענים מ-CSS variables בזמן ריצה.

## עקרונות
- נקי, מקצועי, הרבה whitespace. בלי גרדיאנטים מיותרים, בלי צללים כבדים.
- **RTL מלא** — עברית בכל מקום. כל layout נבנה ל-RTL מההתחלה.
- עקביות ויזואלית > יצירתיות נקודתית. אותו כפתור בכל מקום.

## צבעים (Color Tokens)

צבעי מותג ברירת מחדל (ניתנים לדריסה לכל מועדון):
```
--color-primary-700: #1E5C3A   (כהה — hover, טקסט על בהיר)
--color-primary-500: #2E8B57   (ראשי — כפתורים, קישורים)
--color-primary-300: #7BC49A   (בהיר — הדגשות)
--color-primary-50:  #E3F2EA   (רקע עדין — badges, surfaces)
```

צבעים סמנטיים (קבועים — לא משתנים בין מועדונים):
```
--color-success: #2E8B57   רקע: #E3F2EA   טקסט: #1E5C3A   (שולם / פעיל)
--color-warning: #D9A220   רקע: #FBF0D6   טקסט: #8A6410   (ממתין / pending)
--color-danger:  #C7472E   רקע: #FAE4E0   טקסט: #8F2E1C   (פיגור / נכשל)
--color-info:    #3878C2   רקע: #E6F1FB   טקסט: #0C447C   (מידע ניטרלי)
```

ניטרליים:
```
--color-bg-page:      #FAFAF7   (רקע עמוד)
--color-bg-surface:   #FFFFFF   (כרטיסים, טפסים)
--color-bg-muted:     #F5F5F1   (metric cards, אזורים משניים)
--color-border:       #E0E0DA   (גבולות — 0.5px)
--color-text-primary: #2A2A28   (טקסט ראשי)
--color-text-body:    #44443F   (טקסט גוף)
--color-text-muted:   #9C9A92   (טקסט משני, תוויות)
```

מיפוי סטטוס תשלום → צבע (תואם ל-state machine, סעיף 6.2 באפיון):
`paid → success` | `pending → warning` | `overdue/failed → danger` | `draft/canceled → muted` | `partially_paid → info`

## טיפוגרפיה

פונט: **Heebo** או **Assistant** (Google Fonts, תמיכת עברית מצוינת). fallback: system-ui.

```
כותרת ראשית (h1):  26px / 700
כותרת משנה (h2):   18px / 500
כותרת קטנה (h3):   16px / 500
טקסט גוף:          15px / 400   line-height 1.6
טקסט משני/תוויות:  13px / 400
מספרים גדולים (metrics): 24px / 700
```

## ריווח ופינות

```
Spacing scale: 4, 8, 12, 16, 24, 32 (px)
ריווח אנכי בין סקשנים: 24px / 32px
padding פנימי בכרטיס: 16px–20px

Border radius:
--radius-sm: 6px    (badges, inputs)
--radius-md: 10px   (כפתורים, אזורים)
--radius-lg: 16px   (כרטיסים, מודלים)

גבולות: תמיד 0.5px solid var(--color-border)
```

## רכיבי יסוד (Components)

**כפתור ראשי:** רקע `primary-500`, טקסט לבן, radius-md, padding `9px 18px`, 14px/500. hover → `primary-700`.
**כפתור משני:** רקע לבן, גבול `primary-500`, טקסט `primary-500`, אותם מידות.
**כפתור סכנה:** רקע `danger` (למחיקה/ביטול).
**Input/Select:** גובה ~40px, גבול 0.5px, radius-md, padding `10px 12px`, focus ring ב-`primary-300`.
**Badge/סטטוס:** radius-sm, padding `5px 12px`, 12px/500, רקע+טקסט לפי הצבע הסמנטי.
**כרטיס (Card):** רקע לבן, גבול 0.5px, radius-lg, padding 20px.
**Metric card:** רקע `bg-muted`, בלי גבול, radius-md, padding 16px. תווית 13px/muted למעלה, מספר 24px/700 למטה.
**טבלה:** שורות עם גבול תחתון 0.5px, padding `12px`, כותרת ב-`text-muted` 13px. zebra עדין אופציונלי.

## Tailwind config (להעתקה ל-tailwind.config)

```js
theme: {
  extend: {
    colors: {
      primary: { 50:'#E3F2EA', 300:'#7BC49A', 500:'#2E8B57', 700:'#1E5C3A' },
      success: '#2E8B57', warning: '#D9A220', danger: '#C7472E', info: '#3878C2',
    },
    fontFamily: { sans: ['Heebo','Assistant','system-ui','sans-serif'] },
    borderRadius: { sm:'6px', md:'10px', lg:'16px' },
  }
}
```

## הערות מימוש
- צבעי המותג (primary) נטענים כ-CSS variables בזמן ריצה לפי `club_branding` — אל תקודד אותם קשיח ברכיבים. הסמנטיים כן קבועים.
- כל הרכיבים מ-shadcn/ui, מותאמים ל-tokens האלה ול-RTL.
- מצב dark — אופציונלי לעתיד, לא ל-MVP. בנה light קודם אבל אל תקבע צבעים קשיח שיקשו על הוספת dark.
