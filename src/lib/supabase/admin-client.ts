import "server-only";

import { createServerClient } from "@supabase/ssr";

/**
 * Supabase client עם ה-secret key (service_role) — **עוקף RLS**, שרת בלבד.
 * לשימוש בזרימות ציבוריות/ללא-משתמש (הרשמה, webhook), שבהן אין JWT של מועדון.
 * ⚠️ אין הגנת RLS — כל שאילתה חייבת להיות מסוננת מפורשות ל-club_id שנפתר.
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY");
  }
  return createServerClient(url, secret, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {},
    },
  });
}
