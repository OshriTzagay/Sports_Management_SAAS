import type { CSSProperties } from "react";

/**
 * Override של צבע המותג בזמן ריצה, מוחל על שורש אזור המועדון.
 *
 * חשוב: ה-shades חייבים להיות מוגדרים על *אותו* אלמנט שדורס את הצבע — לא רק
 * --brand-base — כי custom property שמוגדר ב-:root (כמו --primary-500) מחושב שם
 * פעם אחת ויורד בירושה כערך מחושב; דריסת --brand-base על צאצא לא תחשב אותו מחדש.
 * לכן מגדירים כאן את כל הסקאלה. ה-color-mix מול surface/text מאפשר התאמה ל-dark.
 */
export function brandStyleVars(
  primaryColor: string | null,
): CSSProperties | undefined {
  if (!primaryColor) return undefined;

  const vars: Record<string, string> = {
    "--brand-base": primaryColor,
    "--primary-500": primaryColor,
    "--primary-700": `color-mix(in oklab, ${primaryColor}, var(--text-primary) 28%)`,
    "--primary-300": `color-mix(in oklab, ${primaryColor}, var(--bg-surface) 42%)`,
    "--primary-50": `color-mix(in oklab, ${primaryColor}, var(--bg-surface) 88%)`,
  };
  return vars as CSSProperties;
}
