import { createServerClient } from "@supabase/ssr";
import { type NextRequest, type NextResponse } from "next/server";

import { env } from "@/lib/env";

/**
 * מרענן את סשן ה-Supabase ומסנכרן cookies על ה-response שכבר נקבע
 * (next או rewrite). אל תכניס לוגיקה בין יצירת ה-client ל-getUser.
 */
export async function refreshSession(
  request: NextRequest,
  response: NextResponse,
): Promise<void> {
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
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // רענון הטוקן — חייב לרוץ כדי לשמור את הסשן חי.
  await supabase.auth.getUser();
}
