import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

/**
 * Supabase client לשימוש בצד שרת (Server Components, Route Handlers, Actions).
 * משתמש במפתח ה-publishable — כל הגישה כפופה ל-RLS לפי המשתמש המחובר.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // נקרא מתוך Server Component — אפשר להתעלם כש-middleware מרענן סשנים.
        }
      },
    },
  });
}
