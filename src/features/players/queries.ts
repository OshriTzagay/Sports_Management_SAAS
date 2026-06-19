import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Player } from "./types";

/** כל שחקני המועדון (זהות — לא תלוי עונה). RLS מסנן ל-club_id. */
export async function listPlayers(): Promise<Player[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("players")
    .select(
      "id, club_id, first_name, last_name, national_id, birth_date, status, created_at",
    )
    .is("deleted_at", null)
    .order("last_name");

  if (error) throw new Error(error.message);
  return (data as Player[] | null) ?? [];
}
