"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/features/tenant-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const dateField = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

const createSchema = z.object({
  name: z.string().trim().min(1, "שם עונה נדרש"),
  startsOn: dateField,
  endsOn: dateField,
});

export type CreateSeasonState = { error: string | null };

/** יצירת עונה חדשה (לא פעילה כברירת מחדל). club_id נלקח מהמשתמש המחובר. */
export async function createSeasonAction(
  _prev: CreateSeasonState,
  formData: FormData,
): Promise<CreateSeasonState> {
  const user = await requireUser();

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    startsOn: formData.get("startsOn"),
    endsOn: formData.get("endsOn"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("seasons").insert({
    club_id: user.club_id,
    name: parsed.data.name,
    starts_on: parsed.data.startsOn,
    ends_on: parsed.data.endsOn,
  });
  if (error) return { error: error.message };

  revalidatePath("/seasons");
  return { error: null };
}

/** הפעלת עונה (מכבה את הקודמת — עונה פעילה אחת למועדון). */
export async function activateSeasonAction(formData: FormData): Promise<void> {
  await requireUser();
  const seasonId = z.string().uuid().parse(formData.get("seasonId"));

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("set_active_season", {
    p_season_id: seasonId,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/seasons");
}

/** סגירת עונה (read-only). */
export async function closeSeasonAction(formData: FormData): Promise<void> {
  await requireUser();
  const seasonId = z.string().uuid().parse(formData.get("seasonId"));

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("seasons")
    .update({ status: "closed" })
    .eq("id", seasonId);
  if (error) throw new Error(error.message);

  revalidatePath("/seasons");
}
