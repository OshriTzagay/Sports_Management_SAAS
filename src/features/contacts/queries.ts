import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Contact, PlayerContactLink, Relationship } from "./types";

export interface PlayerContactRow extends PlayerContactLink {
  player_id: string;
}

interface RawLink {
  id: string;
  player_id: string;
  contact_id: string;
  relationship: Relationship;
  is_billing_contact: boolean;
  contacts:
    | {
        first_name: string;
        last_name: string | null;
        phone: string | null;
        email: string | null;
      }
    | {
        first_name: string;
        last_name: string | null;
        phone: string | null;
        email: string | null;
      }[]
    | null;
}

function pickContact(c: RawLink["contacts"]) {
  return Array.isArray(c) ? c[0] : c;
}

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

/** כל קישורי השחקן↔איש-קשר של המועדון (כולל פרטי איש הקשר). */
export async function listPlayerContacts(): Promise<PlayerContactRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("player_contacts")
    .select(
      "id, player_id, contact_id, relationship, is_billing_contact, contacts(first_name, last_name, phone, email)",
    )
    .is("deleted_at", null);

  if (error) throw new Error(error.message);
  return ((data as unknown as RawLink[] | null) ?? []).map((row) => {
    const c = pickContact(row.contacts);
    return {
      id: row.id,
      player_id: row.player_id,
      contact_id: row.contact_id,
      relationship: row.relationship,
      is_billing_contact: row.is_billing_contact,
      first_name: c?.first_name ?? "",
      last_name: c?.last_name ?? null,
      phone: c?.phone ?? null,
      email: c?.email ?? null,
    };
  });
}
