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
  if (error) {
    return { error: toUserMessage(error, "כבר קיים שחקן עם ת.ז. זו במועדון") };
  }

  revalidatePath("/tenant", "layout");
  return { error: null };
}

type Supabase = Awaited<ReturnType<typeof createServerSupabaseClient>>;
const idOrEmpty = z
  .union([z.string().uuid(), z.literal("")])
  .optional()
  .transform((v) => (v ? v : null));

/** מסיר שיבוץ פעיל לעונה ומשבץ מחדש אם נבחרה קבוצה (שיבוץ אחד לעונה). */
async function applyTeamAssignment(
  supabase: Supabase,
  clubId: string,
  seasonId: string,
  playerId: string,
  teamId: string | null,
): Promise<void> {
  const { error: removeError } = await supabase
    .from("team_players")
    .update({ deleted_at: new Date().toISOString() })
    .eq("season_id", seasonId)
    .eq("player_id", playerId)
    .is("deleted_at", null);
  if (removeError) throw new Error(removeError.message);

  if (teamId) {
    const { error: insertError } = await supabase.from("team_players").insert({
      club_id: clubId,
      season_id: seasonId,
      team_id: teamId,
      player_id: playerId,
    });
    if (insertError) throw new Error(insertError.message);
  }
}

const updateSchema = createSchema.extend({
  playerId: z.string().uuid(),
  status: z.enum(["active", "inactive", "left"]),
  seasonId: idOrEmpty,
  teamId: idOrEmpty,
});

/** עדכון מלא של שחקן מהמודאל: זהות + סטטוס + שיבוץ לקבוצה בעונה. */
export async function updatePlayerAction(
  _prev: CreatePlayerState,
  formData: FormData,
): Promise<CreatePlayerState> {
  const user = await requireUser();

  const parsed = updateSchema.safeParse({
    playerId: formData.get("playerId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    nationalId: formData.get("nationalId"),
    birthDate: formData.get("birthDate"),
    status: formData.get("status"),
    seasonId: formData.get("seasonId"),
    teamId: formData.get("teamId"),
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
      status: parsed.data.status,
    })
    .eq("id", parsed.data.playerId);
  if (error) {
    return { error: toUserMessage(error, "כבר קיים שחקן עם ת.ז. זו במועדון") };
  }

  if (parsed.data.seasonId) {
    try {
      await applyTeamAssignment(
        supabase,
        user.club_id,
        parsed.data.seasonId,
        parsed.data.playerId,
        parsed.data.teamId,
      );
    } catch (err) {
      return { error: err instanceof Error ? err.message : "שגיאה בשיבוץ" };
    }
  }

  revalidatePath("/tenant", "layout");
  return { error: null };
}
