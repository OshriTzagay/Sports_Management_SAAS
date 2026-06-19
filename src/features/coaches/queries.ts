import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Coach } from "./types";

/** כל מאמני המועדון (זהות — לא תלוי עונה). RLS מסנן ל-club_id. */
export async function listCoaches(): Promise<Coach[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("coaches")
    .select(
      "id, club_id, first_name, last_name, phone, certification, license_expiry, status, created_at",
    )
    .is("deleted_at", null)
    .order("last_name");

  if (error) throw new Error(error.message);
  return (data as Coach[] | null) ?? [];
}
