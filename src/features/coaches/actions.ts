"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/features/tenant-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { toUserMessage } from "@/lib/db-error";

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

  revalidatePath("/tenant", "layout");
  return { error: null };
}

const updateSchema = createSchema.extend({
  coachId: z.string().uuid(),
  status: z.enum(["active", "inactive"]),
});

/** עדכון מלא של מאמן מהמודאל: זהות + הסמכות + סטטוס. */
export async function updateCoachAction(
  _prev: CreateCoachState,
  formData: FormData,
): Promise<CreateCoachState> {
  await requireUser();

  const parsed = updateSchema.safeParse({
    coachId: formData.get("coachId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    certification: formData.get("certification"),
    licenseExpiry: formData.get("licenseExpiry"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("coaches")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      phone: parsed.data.phone,
      certification: parsed.data.certification,
      license_expiry: parsed.data.licenseExpiry,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.coachId);
  if (error) return { error: error.message };

  revalidatePath("/tenant", "layout");
  return { error: null };
}

/** שיוך מאמן לקבוצה בעונה עם תפקיד. מחזיר הודעת שגיאה (למשל שיוך כפול). */
export async function addCoachAssignmentAction(
  formData: FormData,
): Promise<{ error: string | null }> {
  const user = await requireUser();
  const parsed = z
    .object({
      coachId: z.string().uuid(),
      teamId: z.string().uuid(),
      seasonId: z.string().uuid(),
      role: z.enum(["head", "assistant", "goalkeeping"]),
    })
    .safeParse({
      coachId: formData.get("coachId"),
      teamId: formData.get("teamId"),
      seasonId: formData.get("seasonId"),
      role: formData.get("role"),
    });
  if (!parsed.success) return { error: "קלט לא תקין" };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("team_coaches").insert({
    club_id: user.club_id,
    season_id: parsed.data.seasonId,
    team_id: parsed.data.teamId,
    coach_id: parsed.data.coachId,
    role: parsed.data.role,
  });
  if (error) {
    return { error: toUserMessage(error, "המאמן כבר משויך לקבוצה זו בעונה") };
  }

  revalidatePath("/tenant", "layout");
  return { error: null };
}

/** הסרת שיוך מאמן↔קבוצה (soft-delete). */
export async function removeCoachAssignmentAction(
  formData: FormData,
): Promise<void> {
  await requireUser();
  const assignmentId = z.string().uuid().parse(formData.get("assignmentId"));

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("team_coaches")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", assignmentId);
  if (error) throw new Error(error.message);

  revalidatePath("/tenant", "layout");
}
