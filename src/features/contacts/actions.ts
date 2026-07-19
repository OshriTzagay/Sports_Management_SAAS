"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requirePermission } from "@/features/tenant-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { toUserMessage } from "@/lib/db-error";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

const baseSchema = z.object({
  firstName: z.string().trim().min(1, "שם נדרש"),
  lastName: optionalText,
  phone: optionalText,
  email: z
    .union([z.string().email("אימייל לא תקין"), z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
});

export type ContactFormState = { error: string | null };

/** יצירת איש קשר (נתונים בלבד — אין login). club_id מהמשתמש המחובר. */
export async function createContactAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const user = await requirePermission("contacts.manage");

  const parsed = baseSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("contacts").insert({
    club_id: user.club_id,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    phone: parsed.data.phone,
    email: parsed.data.email,
  });
  if (error) return { error: error.message };

  revalidatePath("/tenant", "layout");
  return { error: null };
}

const updateSchema = baseSchema.extend({ contactId: z.string().uuid() });

/** עדכון פרטי איש קשר. */
export async function updateContactAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  await requirePermission("contacts.manage");

  const parsed = updateSchema.safeParse({
    contactId: formData.get("contactId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("contacts")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      phone: parsed.data.phone,
      email: parsed.data.email,
    })
    .eq("id", parsed.data.contactId);
  if (error) return { error: error.message };

  revalidatePath("/tenant", "layout");
  return { error: null };
}

/** מחיקה רכה של איש קשר. */
export async function deleteContactAction(formData: FormData): Promise<void> {
  await requirePermission("contacts.manage");
  const contactId = z.string().uuid().parse(formData.get("contactId"));

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("contacts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", contactId);
  if (error) throw new Error(error.message);

  revalidatePath("/tenant", "layout");
}

const relationshipEnum = z.enum([
  "father",
  "mother",
  "guardian",
  "self",
  "other",
]);

/** קישור איש קשר קיים לשחקן עם קרבה. מחזיר הודעת שגיאה (למשל קישור כפול). */
export async function addPlayerContactAction(
  formData: FormData,
): Promise<{ error: string | null }> {
  const user = await requirePermission("contacts.manage");
  const parsed = z
    .object({
      playerId: z.string().uuid(),
      contactId: z.string().uuid(),
      relationship: relationshipEnum,
    })
    .safeParse({
      playerId: formData.get("playerId"),
      contactId: formData.get("contactId"),
      relationship: formData.get("relationship"),
    });
  if (!parsed.success) return { error: "קלט לא תקין" };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("player_contacts").insert({
    club_id: user.club_id,
    player_id: parsed.data.playerId,
    contact_id: parsed.data.contactId,
    relationship: parsed.data.relationship,
  });
  if (error) {
    return { error: toUserMessage(error, "איש הקשר כבר מקושר לשחקן") };
  }

  revalidatePath("/tenant", "layout");
  return { error: null };
}

/** הסרת קישור איש-קשר↔שחקן (soft-delete). */
export async function removePlayerContactAction(
  formData: FormData,
): Promise<void> {
  await requirePermission("contacts.manage");
  const linkId = z.string().uuid().parse(formData.get("linkId"));

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("player_contacts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", linkId);
  if (error) throw new Error(error.message);

  revalidatePath("/tenant", "layout");
}

/** קביעת איש הקשר לחיוב לשחקן (יחיד — מבטל את הקודם). */
export async function setBillingContactAction(
  formData: FormData,
): Promise<void> {
  await requirePermission("contacts.manage");
  const parsed = z
    .object({ playerId: z.string().uuid(), linkId: z.string().uuid() })
    .parse({
      playerId: formData.get("playerId"),
      linkId: formData.get("linkId"),
    });

  const supabase = await createServerSupabaseClient();
  // מבטלים את כל החיובים של השחקן ואז מסמנים את הנבחר — כדי לא להפר את האילוץ.
  const { error: clearError } = await supabase
    .from("player_contacts")
    .update({ is_billing_contact: false })
    .eq("player_id", parsed.playerId)
    .is("deleted_at", null);
  if (clearError) throw new Error(clearError.message);

  const { error } = await supabase
    .from("player_contacts")
    .update({ is_billing_contact: true })
    .eq("id", parsed.linkId);
  if (error) throw new Error(error.message);

  revalidatePath("/tenant", "layout");
}
