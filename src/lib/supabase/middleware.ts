import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";

/**
 * מרענן את סשן ה-Supabase בכל בקשה ומסנכרן את ה-cookies.
 * חובה: אל תכניס לוגיקה בין יצירת ה-client ל-getUser (סיכון להתנתקויות אקראיות).
 * ניתוב לפי אזור (admin מול app) והגנת auth ייבנו מעל זה בשלב הבא.
 */
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.supabaseUrl,
    env.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // רענון הטוקן — חייב לרוץ כדי לשמור את הסשן חי.
  await supabase.auth.getUser();

  return supabaseResponse;
}
