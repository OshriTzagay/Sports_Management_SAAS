/**
 * גישה מטיפוסת ומאומתת למשתני סביבה.
 * נכשל קולני בזמן עלייה אם חסר ערך — עדיף מ-`!` שקט שמתפוצץ ב-runtime.
 *
 * הערה: Next מחליף את `process.env.NEXT_PUBLIC_*` סטטית בזמן build, לכן
 * חובה לכתוב את הביטוי במפורש (לא לגשת דינמית במפתח משתנה).
 */
function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  supabaseUrl: required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ),
  supabasePublishableKey: required(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
} as const;
