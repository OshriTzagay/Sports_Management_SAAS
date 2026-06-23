import type { CSSProperties } from "react";

/**
 * מחזיר override לצבע המותג כ-CSS variable יחיד (--brand-base). כל סקאלת ה-primary
 * נגזרת ממנו ב-globals.css (color-mix מול tokens של surface/text), כך שהמיתוג
 * מסתגל אוטומטית למצב בהיר/כהה. מוחל על שורש אזור המועדון בזמן ריצה.
 */
export function brandStyleVars(
  primaryColor: string | null,
): CSSProperties | undefined {
  if (!primaryColor) return undefined;
  return { "--brand-base": primaryColor } as CSSProperties;
}
