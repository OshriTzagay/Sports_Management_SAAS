"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/features/tenant-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
  const user = await requireUser();

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
  await requireUser();

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
  await requireUser();
  const contactId = z.string().uuid().parse(formData.get("contactId"));

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("contacts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", contactId);
  if (error) throw new Error(error.message);

  revalidatePath("/tenant", "layout");
}
