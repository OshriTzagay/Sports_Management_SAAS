import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ClubBranding } from "./types";

/** ה-branding של המועדון המחובר, או null אם לא הוגדר. */
export async function getClubBranding(): Promise<ClubBranding | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("club_branding")
    .select("club_id, display_name, primary_color, logo_path")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as ClubBranding | null) ?? null;
}
