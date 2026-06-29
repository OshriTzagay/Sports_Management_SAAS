import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Contact } from "./types";

/** כל אנשי הקשר של המועדון (נתונים בלבד). RLS מסנן ל-club_id. */
export async function listContacts(): Promise<Contact[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("id, club_id, first_name, last_name, phone, email, created_at")
    .is("deleted_at", null)
    .order("last_name", { nullsFirst: false })
    .order("first_name");

  if (error) throw new Error(error.message);
  return (data as Contact[] | null) ?? [];
}
