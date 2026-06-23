"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/features/tenant-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const createSchema = z.object({
  name: z.string().trim().min(1, "שם קבוצה נדרש"),
  ageCategory: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
  seasonId: z.string().uuid(),
});

export type CreateTeamState = { error: string | null };

/** יצירת קבוצה בעונה נתונה. club_id נלקח מהמשתמש המחובר. */
export async function createTeamAction(
  _prev: CreateTeamState,
  formData: FormData,
): Promise<CreateTeamState> {
  const user = await requireUser();

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    ageCategory: formData.get("ageCategory"),
    seasonId: formData.get("seasonId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("teams").insert({
    club_id: user.club_id,
    season_id: parsed.data.seasonId,
    name: parsed.data.name,
    age_category: parsed.data.ageCategory,
  });
  if (error) return { error: error.message };

  revalidatePath("/tenant", "layout");
  return { error: null };
}

/** מחיקה רכה של קבוצה (soft-delete). */
export async function deleteTeamAction(formData: FormData): Promise<void> {
  await requireUser();
  const teamId = z.string().uuid().parse(formData.get("teamId"));

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("teams")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", teamId);
  if (error) throw new Error(error.message);

  revalidatePath("/tenant", "layout");
}
