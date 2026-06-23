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
  nationalId: optionalText,
  birthDate: optionalText,
});

export type CreatePlayerState = { error: string | null };

/** יצירת שחקן (זהות). club_id נלקח מהמשתמש המחובר. */
export async function createPlayerAction(
  _prev: CreatePlayerState,
  formData: FormData,
): Promise<CreatePlayerState> {
  const user = await requireUser();

  const parsed = createSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    nationalId: formData.get("nationalId"),
    birthDate: formData.get("birthDate"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("players").insert({
    club_id: user.club_id,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    national_id: parsed.data.nationalId,
    birth_date: parsed.data.birthDate,
  });
  if (error) return { error: error.message };

  revalidatePath("/tenant", "layout");
  return { error: null };
}

const updateSchema = createSchema.extend({ playerId: z.string().uuid() });

/** עדכון פרטי שחקן (זהות). */
export async function updatePlayerAction(
  _prev: CreatePlayerState,
  formData: FormData,
): Promise<CreatePlayerState> {
  await requireUser();

  const parsed = updateSchema.safeParse({
    playerId: formData.get("playerId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    nationalId: formData.get("nationalId"),
    birthDate: formData.get("birthDate"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("players")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      national_id: parsed.data.nationalId,
      birth_date: parsed.data.birthDate,
    })
    .eq("id", parsed.data.playerId);
  if (error) return { error: error.message };

  revalidatePath("/tenant", "layout");
  return { error: null };
}

/** שינוי סטטוס שחקן (פעיל/לא פעיל/עזב). "עזב" = סטטוס, לא מחיקה. */
export async function setPlayerStatusAction(formData: FormData): Promise<void> {
  await requireUser();
  const parsed = z
    .object({
      playerId: z.string().uuid(),
      status: z.enum(["active", "inactive", "left"]),
    })
    .parse({
      playerId: formData.get("playerId"),
      status: formData.get("status"),
    });

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("players")
    .update({ status: parsed.status })
    .eq("id", parsed.playerId);
  if (error) throw new Error(error.message);

  revalidatePath("/tenant", "layout");
}

/** שיבוץ שחקן לקבוצה בעונה (teamId ריק = הסרת שיבוץ). שיבוץ אחד לעונה. */
export async function assignPlayerToTeamAction(
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  const parsed = z
    .object({
      playerId: z.string().uuid(),
      seasonId: z.string().uuid(),
      teamId: z.union([z.string().uuid(), z.literal("")]),
    })
    .parse({
      playerId: formData.get("playerId"),
      seasonId: formData.get("seasonId"),
      teamId: formData.get("teamId") ?? "",
    });

  const supabase = await createServerSupabaseClient();

  // מסירים שיבוץ פעיל קיים לאותה עונה (soft-delete), ואז משבצים מחדש אם נבחרה קבוצה.
  const { error: removeError } = await supabase
    .from("team_players")
    .update({ deleted_at: new Date().toISOString() })
    .eq("season_id", parsed.seasonId)
    .eq("player_id", parsed.playerId)
    .is("deleted_at", null);
  if (removeError) throw new Error(removeError.message);

  if (parsed.teamId) {
    const { error: insertError } = await supabase.from("team_players").insert({
      club_id: user.club_id,
      season_id: parsed.seasonId,
      team_id: parsed.teamId,
      player_id: parsed.playerId,
    });
    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath("/tenant", "layout");
}
