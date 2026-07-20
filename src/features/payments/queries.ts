import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DEFAULT_BILLING_SETTINGS, type BillingSettings } from "./types";

/** הגדרות החיוב של המועדון; ברירת מחדל (0% / ILS) אם טרם הוגדרו. */
export async function getBillingSettings(): Promise<BillingSettings> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("billing_settings")
    .select("vat_rate, currency")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return DEFAULT_BILLING_SETTINGS;

  // numeric חוזר לעיתים כמחרוזת מ-supabase-js.
  const row = data as { vat_rate: number | string; currency: string };
  return { vat_rate: Number(row.vat_rate), currency: row.currency };
}
