import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";

/** Supabase client לשימוש בצד הדפדפן (Client Components). */
export function createBrowserSupabaseClient() {
  return createBrowserClient(env.supabaseUrl, env.supabasePublishableKey);
}
