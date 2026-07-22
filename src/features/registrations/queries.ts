import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { RegistrationContext, RegistrationRow } from "./types";

/**
 * פותר את הקשר ההרשמה לפי slug המועדון (זרימה ציבורית — service role).
 * חושף רק מיתוג + דמי רישום + עונה + פתוח?. מסונן מפורשות ל-club שנפתר.
 */
export async function getRegistrationContext(
  slug: string,
): Promise<RegistrationContext | null> {
  const admin = createAdminSupabaseClient();

  const { data: clubData } = await admin
    .from("clubs")
    .select("id, name, status")
    .eq("slug", slug)
    .maybeSingle();
  const club = clubData as { id: string; name: string; status: string } | null;
  if (!club || club.status === "suspended") return null;

  const [{ data: brandingData }, { data: billingData }, { data: seasonData }] =
    await Promise.all([
      admin
        .from("club_branding")
        .select("display_name, logo_path, primary_color")
        .eq("club_id", club.id)
        .maybeSingle(),
      admin
        .from("billing_settings")
        .select(
          "registration_fee_agorot, vat_rate, currency, registration_open",
        )
        .eq("club_id", club.id)
        .maybeSingle(),
      admin
        .from("seasons")
        .select("id, name")
        .eq("club_id", club.id)
        .eq("is_active", true)
        .is("deleted_at", null)
        .maybeSingle(),
    ]);

  const branding = brandingData as {
    display_name: string | null;
    logo_path: string | null;
    primary_color: string | null;
  } | null;
  const billing = billingData as {
    registration_fee_agorot: number | string;
    vat_rate: number | string;
    currency: string;
    registration_open: boolean;
  } | null;
  const season = seasonData as { id: string; name: string } | null;

  return {
    clubId: club.id,
    clubName: branding?.display_name ?? club.name,
    logoPath: branding?.logo_path ?? null,
    primaryColor: branding?.primary_color ?? null,
    feeAgorot: Number(billing?.registration_fee_agorot ?? 0),
    vatRate: Number(billing?.vat_rate ?? 0),
    currency: billing?.currency ?? "ILS",
    seasonId: season?.id ?? null,
    seasonName: season?.name ?? null,
    open: billing?.registration_open ?? false,
  };
}

/** הרשמות המועדון (שקיפות לצוות; RLS מסנן ל-club_id). */
export async function listRegistrations(): Promise<RegistrationRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("registrations")
    .select(
      "id, status, player_first_name, player_last_name, contact_first_name, contact_phone, amount_agorot, currency, created_at, completed_at, player_id",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as RegistrationRow[];
}
