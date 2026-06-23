interface DbError {
  code?: string | null;
  message: string;
}

/**
 * ממיר שגיאת DB להודעה ידידותית. הפרה של אילוץ ייחודיות (23505) מקבלת הודעה
 * ספציפית; אחרת מחזיר את הודעת המקור.
 */
export function toUserMessage(error: DbError, onDuplicate: string): string {
  if (error.code === "23505") return onDuplicate;
  return error.message;
}
