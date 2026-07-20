"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requirePermission } from "@/features/tenant-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBillingSettings } from "./queries";

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

type Supabase = Awaited<ReturnType<typeof createServerSupabaseClient>>;

/** שקלים → אגורות (integer). */
function toAgorot(shekels: number): number {
  return Math.round(shekels * 100);
}

const moneyField = z.coerce.number().min(0, "סכום לא תקין");
const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

const createChargeSchema = z.object({
  playerId: z.string().uuid(),
  description: z.string().trim().min(1, "תיאור נדרש"),
  amount: moneyField, // מחיר מלא (שקלים)
  discount: moneyField.optional().default(0), // הנחה/מלגה (שקלים)
  discountReason: optionalText,
  dueDate: optionalText,
});

export type CreateChargeState = { error: string | null };

/**
 * יצירת חיוב לשחקן (payments.charge). מצלם מע"מ/מטבע מהגדרות המועדון,
 * משייך את איש הקשר לחיוב, ומחשב נטו אחרי הנחה. נטו 0 → פטור (waived).
 */
export async function createChargeAction(
  _prev: CreateChargeState,
  formData: FormData,
): Promise<CreateChargeState> {
  const user = await requirePermission("payments.charge");

  const parsed = createChargeSchema.safeParse({
    playerId: formData.get("playerId"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    discount: formData.get("discount"),
    discountReason: formData.get("discountReason"),
    dueDate: formData.get("dueDate"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const originalAgorot = toAgorot(parsed.data.amount);
  const discountAgorot = toAgorot(parsed.data.discount);
  const netAgorot = originalAgorot - discountAgorot;
  if (netAgorot < 0) return { error: "ההנחה גדולה מהסכום" };

  const supabase = await createServerSupabaseClient();
  const billing = await getBillingSettings();

  // איש הקשר לחיוב של השחקן (אם הוגדר).
  const { data: billingLink } = await supabase
    .from("player_contacts")
    .select("contact_id")
    .eq("player_id", parsed.data.playerId)
    .eq("is_billing_contact", true)
    .is("deleted_at", null)
    .maybeSingle();

  const { error } = await supabase.from("charges").insert({
    club_id: user.club_id,
    player_id: parsed.data.playerId,
    contact_id:
      (billingLink as { contact_id: string } | null)?.contact_id ?? null,
    description: parsed.data.description,
    amount_agorot: netAgorot,
    original_amount_agorot: originalAgorot,
    discount_agorot: discountAgorot,
    discount_reason: parsed.data.discountReason,
    vat_rate: billing.vat_rate,
    currency: billing.currency,
    status: netAgorot === 0 ? "waived" : "pending",
    due_date: parsed.data.dueDate,
    created_by: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/tenant", "layout");
  return { error: null };
}

/** חישוב מחדש של סטטוס החיוב לפי סכום התשלומים שהתקבלו. */
async function recomputeChargeStatus(
  supabase: Supabase,
  chargeId: string,
  amountAgorot: number,
): Promise<void> {
  const { data } = await supabase
    .from("payments")
    .select("amount_agorot, status")
    .eq("charge_id", chargeId);
  const paid = ((data ?? []) as { amount_agorot: number; status: string }[])
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount_agorot, 0);

  const status =
    paid >= amountAgorot ? "paid" : paid > 0 ? "partially_paid" : "pending";
  await supabase.from("charges").update({ status }).eq("id", chargeId);
}

const manualPaymentSchema = z.object({
  chargeId: z.string().uuid(),
  amount: moneyField.refine((v) => v > 0, "סכום נדרש"),
  method: z.enum(["cash", "bank_transfer", "check", "other"]),
});

/** רישום תשלום ידני (מזומן/העברה/צ׳ק) לחיוב + עדכון סטטוס. */
export async function recordManualPaymentAction(
  formData: FormData,
): Promise<void> {
  const user = await requirePermission("payments.charge");
  const parsed = manualPaymentSchema.parse({
    chargeId: formData.get("chargeId"),
    amount: formData.get("amount"),
    method: formData.get("method"),
  });

  const supabase = await createServerSupabaseClient();
  const { data: charge } = await supabase
    .from("charges")
    .select("id, amount_agorot, currency, status")
    .eq("id", parsed.chargeId)
    .is("deleted_at", null)
    .maybeSingle();
  const row = charge as {
    amount_agorot: number;
    currency: string;
    status: string;
  } | null;
  if (!row) throw new Error("חיוב לא נמצא");
  if (row.status === "cancelled") {
    throw new Error("לא ניתן לרשום תשלום לחיוב שבוטל");
  }

  const { error } = await supabase.from("payments").insert({
    club_id: user.club_id,
    charge_id: parsed.chargeId,
    amount_agorot: toAgorot(parsed.amount),
    currency: row.currency,
    provider: "manual",
    method: parsed.method,
    status: "completed",
  });
  if (error) throw new Error(error.message);

  await recomputeChargeStatus(supabase, parsed.chargeId, row.amount_agorot);
  revalidatePath("/tenant", "layout");
}

/** פטור מלא מחיוב (payments.charge). */
export async function waiveChargeAction(formData: FormData): Promise<void> {
  await requirePermission("payments.charge");
  const chargeId = z.string().uuid().parse(formData.get("chargeId"));
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("charges")
    .update({ status: "waived" })
    .eq("id", chargeId);
  if (error) throw new Error(error.message);
  revalidatePath("/tenant", "layout");
}

/** ביטול חיוב (payments.charge). */
export async function cancelChargeAction(formData: FormData): Promise<void> {
  await requirePermission("payments.charge");
  const chargeId = z.string().uuid().parse(formData.get("chargeId"));
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("charges")
    .update({ status: "cancelled" })
    .eq("id", chargeId);
  if (error) throw new Error(error.message);
  revalidatePath("/tenant", "layout");
}
