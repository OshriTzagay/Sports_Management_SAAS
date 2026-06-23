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

  revalidatePath("/tenant", "layout");
  return { error: null };
}

const updateSchema = createSchema.extend({ coachId: z.string().uuid() });

/** עדכון פרטי מאמן. */
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
    })
    .eq("id", parsed.data.coachId);
  if (error) return { error: error.message };

  revalidatePath("/tenant", "layout");
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

  revalidatePath("/tenant", "layout");
}

/** שיוך מאמן לקבוצה בעונה עם תפקיד. */
export async function addCoachAssignmentAction(
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  const parsed = z
    .object({
      coachId: z.string().uuid(),
      teamId: z.string().uuid(),
      seasonId: z.string().uuid(),
      role: z.enum(["head", "assistant", "goalkeeping"]),
    })
    .parse({
      coachId: formData.get("coachId"),
      teamId: formData.get("teamId"),
      seasonId: formData.get("seasonId"),
      role: formData.get("role"),
    });

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("team_coaches").insert({
    club_id: user.club_id,
    season_id: parsed.seasonId,
    team_id: parsed.teamId,
    coach_id: parsed.coachId,
    role: parsed.role,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/tenant", "layout");
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
