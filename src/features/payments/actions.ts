"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requirePermission } from "@/features/tenant-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const settingsSchema = z.object({
  vatRate: z.coerce
    .number()
    .min(0, 'שיעור מע"מ לא תקין')
    .max(100, 'שיעור מע"מ לא תקין'),
  currency: z.string().trim().min(1),
});

export type BillingSettingsState = { error: string | null; ok?: boolean };

/** עדכון הגדרות החיוב (מע"מ/מטבע) — Owner (settings.manage). */
export async function updateBillingSettingsAction(
  _prev: BillingSettingsState,
  formData: FormData,
): Promise<BillingSettingsState> {
  const user = await requirePermission("settings.manage");

  const parsed = settingsSchema.safeParse({
    vatRate: formData.get("vatRate"),
    currency: formData.get("currency"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("billing_settings").upsert(
    {
      club_id: user.club_id,
      vat_rate: parsed.data.vatRate,
      currency: parsed.data.currency,
    },
    { onConflict: "club_id" },
  );
  if (error) return { error: error.message };

  revalidatePath("/tenant", "layout");
  return { error: null, ok: true };
}
