import "server-only";

import { cookies } from "next/headers";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Season } from "./types";

export const SEASON_COOKIE = "season_id";

const COLUMNS =
  "id, club_id, name, starts_on, ends_on, is_active, status, created_at";

/** כל העונות של המועדון (RLS מסנן ל-club_id). החדשה ביותר ראשונה. */
export async function listSeasons(): Promise<Season[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("seasons")
    .select(COLUMNS)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Season[] | null) ?? [];
}

/** העונה הפעילה של המועדון (ברירת המחדל לפילטר הגלובלי), או null. */
export async function getActiveSeason(): Promise<Season | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("seasons")
    .select(COLUMNS)
    .is("deleted_at", null)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Season | null) ?? null;
}

/**
 * העונה הנבחרת לתצוגה — לפי cookie (מתג העונה), עם נפילה לעונה הפעילה.
 * ה-cookie מאומת מול RLS (מחזיר רק עונה של המועדון); אחרת ברירת מחדל = פעילה.
 */
export async function getSelectedSeason(): Promise<Season | null> {
  const cookieStore = await cookies();
  const cookieId = cookieStore.get(SEASON_COOKIE)?.value;

  if (cookieId) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("seasons")
      .select(COLUMNS)
      .eq("id", cookieId)
      .is("deleted_at", null)
      .maybeSingle();
    if (data) return data as Season;
  }

  return getActiveSeason();
}
