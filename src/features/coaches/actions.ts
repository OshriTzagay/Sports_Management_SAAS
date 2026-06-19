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

const createSchema = z.object({
  firstName: z.string().trim().min(1, "שם פרטי נדרש"),
  lastName: z.string().trim().min(1, "שם משפחה נדרש"),
  phone: optionalText,
  certification: optionalText,
  licenseExpiry: optionalText,
});

export type CreateCoachState = { error: string | null };

/** יצירת מאמן (זהות). club_id נלקח מהמשתמש המחובר. */
export async function createCoachAction(
  _prev: CreateCoachState,
  formData: FormData,
): Promise<CreateCoachState> {
  const user = await requireUser();

  const parsed = createSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    certification: formData.get("certification"),
    licenseExpiry: formData.get("licenseExpiry"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("coaches").insert({
    club_id: user.club_id,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    phone: parsed.data.phone,
    certification: parsed.data.certification,
    license_expiry: parsed.data.licenseExpiry,
  });
  if (error) return { error: error.message };

  revalidatePath("/coaches");
  return { error: null };
}

/** שינוי סטטוס מאמן (פעיל/לא פעיל). */
export async function setCoachStatusAction(formData: FormData): Promise<void> {
  await requireUser();
  const parsed = z
    .object({
      coachId: z.string().uuid(),
      status: z.enum(["active", "inactive"]),
    })
    .parse({
      coachId: formData.get("coachId"),
      status: formData.get("status"),
    });

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("coaches")
    .update({ status: parsed.status })
    .eq("id", parsed.coachId);
  if (error) throw new Error(error.message);

  revalidatePath("/coaches");
}
