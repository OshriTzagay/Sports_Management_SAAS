import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Club } from "./types";

/** רשימת כל המועדונים (Control Plane — RLS מתיר למשתמש פלטפורמה לראות הכל). */
export async function listClubs(): Promise<Club[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("id, name, slug, status, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Club[] | null) ?? [];
}
