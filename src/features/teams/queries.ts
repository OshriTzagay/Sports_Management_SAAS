import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Team } from "./types";

/** קבוצות המועדון בעונה נתונה (RLS מסנן ל-club_id). */
export async function listTeams(seasonId: string): Promise<Team[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("teams")
    .select("id, club_id, season_id, name, age_category, created_at")
    .eq("season_id", seasonId)
    .is("deleted_at", null)
    .order("name");

  if (error) throw new Error(error.message);
  return (data as Team[] | null) ?? [];
}
