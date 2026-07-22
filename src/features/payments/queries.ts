import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  DEFAULT_BILLING_SETTINGS,
  type BillingSettings,
  type Charge,
  type ChargeStatus,
} from "./types";

/** הגדרות החיוב של המועדון; ברירת מחדל (0% / ILS) אם טרם הוגדרו. */
export async function getBillingSettings(): Promise<BillingSettings> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("billing_settings")
    .select("vat_rate, currency, registration_fee_agorot, registration_open")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return DEFAULT_BILLING_SETTINGS;

  // numeric חוזר לעיתים כמחרוזת מ-supabase-js.
  const row = data as {
    vat_rate: number | string;
    currency: string;
    registration_fee_agorot: number | string;
    registration_open: boolean;
  };
  return {
    vat_rate: Number(row.vat_rate),
    currency: row.currency,
    registration_fee_agorot: Number(row.registration_fee_agorot),
    registration_open: row.registration_open,
  };
}

type NameRel =
  | { first_name: string; last_name: string | null }
  | { first_name: string; last_name: string | null }[]
  | null;

function fullName(rel: NameRel): string | null {
  const r = Array.isArray(rel) ? rel[0] : rel;
  if (!r) return null;
  return [r.first_name, r.last_name].filter(Boolean).join(" ");
}

type RawCharge = {
  id: string;
  player_id: string;
  contact_id: string | null;
  description: string;
  amount_agorot: number;
  original_amount_agorot: number | null;
  discount_agorot: number;
  discount_reason: string | null;
  vat_rate: number | string;
  currency: string;
  status: ChargeStatus;
  due_date: string | null;
  created_at: string;
  players: NameRel;
  contacts: NameRel;
};

const CHARGE_COLUMNS =
  "id, player_id, contact_id, description, amount_agorot, original_amount_agorot, discount_agorot, discount_reason, vat_rate, currency, status, due_date, created_at, players(first_name, last_name), contacts(first_name, last_name)";

/** מצרף לכל חיוב את סכום התשלומים שהתקבלו (agorot). */
async function withPaidAmounts(rows: RawCharge[]): Promise<Charge[]> {
  const supabase = await createServerSupabaseClient();
  const ids = rows.map((r) => r.id);
  const paid: Record<string, number> = {};
  if (ids.length > 0) {
    const { data } = await supabase
      .from("payments")
      .select("charge_id, amount_agorot, status")
      .in("charge_id", ids);
    for (const p of (data ?? []) as {
      charge_id: string;
      amount_agorot: number;
      status: string;
    }[]) {
      if (p.status === "completed") {
        paid[p.charge_id] = (paid[p.charge_id] ?? 0) + p.amount_agorot;
      }
    }
  }
  return rows.map((r) => ({
    id: r.id,
    player_id: r.player_id,
    player_name: fullName(r.players) ?? "—",
    contact_id: r.contact_id,
    contact_name: fullName(r.contacts),
    description: r.description,
    amount_agorot: r.amount_agorot,
    original_amount_agorot: r.original_amount_agorot,
    discount_agorot: r.discount_agorot,
    discount_reason: r.discount_reason,
    vat_rate: Number(r.vat_rate),
    currency: r.currency,
    status: r.status,
    due_date: r.due_date,
    paid_agorot: paid[r.id] ?? 0,
    created_at: r.created_at,
  }));
}

/** כל החיובים של המועדון. */
export async function listCharges(): Promise<Charge[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("charges")
    .select(CHARGE_COLUMNS)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return withPaidAmounts((data ?? []) as unknown as RawCharge[]);
}

/** חיובים של שחקן מסוים. */
export async function listPlayerCharges(playerId: string): Promise<Charge[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("charges")
    .select(CHARGE_COLUMNS)
    .eq("player_id", playerId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return withPaidAmounts((data ?? []) as unknown as RawCharge[]);
}
