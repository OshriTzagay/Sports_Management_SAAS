import type { ReactNode } from "react";

/** פילטר עמודה — בחירת ערך בודד מרשימה. */
export interface DataTableFilter<T> {
  /** תווית הפילטר (ברירת מחדל: כותרת העמודה). */
  label?: string;
  /** מפתח הסינון עבור שורה (מה שמשווים אליו). */
  value: (row: T) => string;
  /** אפשרויות מפורשות; אם חסר — נגזרות מהערכים הייחודיים שבנתונים. */
  options?: { value: string; label: string }[];
}

/** הגדרת עמודה בטבלה הגנרית. */
export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** ערך למיון ולחיפוש הגלובלי; קיומו מפעיל מיון בלחיצה על הכותרת. */
  sortValue?: (row: T) => string | number;
  /** הגדרת פילטר לעמודה (מוסיף בורר לסרגל הכלים). */
  filter?: DataTableFilter<T>;
  align?: "start" | "end";
  headClassName?: string;
  cellClassName?: string;
}
