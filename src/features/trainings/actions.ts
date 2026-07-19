"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  requirePermission,
  requireUser,
  getUserPermissions,
} from "@/features/tenant-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyCoachId } from "./queries";
import type { TrainingStatus } from "./types";

type Supabase = Awaited<ReturnType<typeof createServerSupabaseClient>>;

type EditableSession = {
  id: string;
  season_id: string;
  team_id: string;
  coach_id: string;
  status: TrainingStatus;
};

/**
 * שער עריכה לאימון (default-deny):
 * - trainings.manage נדרש.
 * - אימון שהושלם נעול — רק Owner (users.manage) יכול לתקן.
 * - מאמן יכול לגעת רק באימון של כרטיס המאמן שלו.
 */
async function authorizeTrainingEdit(sessionId: string): Promise<{
  supabase: Supabase;
  session: EditableSession;
  isOwner: boolean;
}> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  // הרשאות, האימון, וקישור-המאמן — במקביל (במקום סדרתית) לקיצור זמן התגובה.
  const [perms, sessionRes, meRes] = await Promise.all([
    getUserPermissions(user),
    supabase
      .from("training_sessions")
      .select("id, season_id, team_id, coach_id, status")
      .eq("id", sessionId)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("users")
      .select("person_type, person_id")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  if (!perms.has("trainings.manage")) throw new Error("אין הרשאה");
  const session = sessionRes.data as EditableSession | null;
  if (!session) throw new Error("אימון לא נמצא");

  const isOwner = perms.has("users.manage");
  if (session.status === "completed" && !isOwner) {
    throw new Error("האימון הסתיים ונעול לעריכה. פנה למנהל.");
  }
  if (!isOwner) {
    const me = meRes.data as {
      person_type: string | null;
      person_id: string | null;
    } | null;
    const coachId = me?.person_type === "coach" ? me.person_id : null;
    if (!coachId || coachId !== session.coach_id) {
      throw new Error("אין הרשאה לאימון זה");
    }
  }
  return { supabase, session, isOwner };
}

const createSchema = z.object({
  teamId: z.string().uuid(),
  seasonId: z.string().uuid(),
  title: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
  scheduledAt: z.string().min(1, "יש לבחור מועד"),
});

export type CreateTrainingState = { error: string | null };

/** יצירת אימון — רק מאמן מקושר, ורק לקבוצה שהוא משויך אליה בעונה. */
export async function createTrainingAction(
  _prev: CreateTrainingState,
  formData: FormData,
): Promise<CreateTrainingState> {
  const user = await requirePermission("trainings.manage");

  const coachId = await getMyCoachId();
  if (!coachId) {
    return { error: "החשבון אינו מקושר לכרטיס מאמן. פנה למנהל." };
  }

  const parsed = createSchema.safeParse({
    teamId: formData.get("teamId"),
    seasonId: formData.get("seasonId"),
    title: formData.get("title"),
    scheduledAt: formData.get("scheduledAt"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const supabase = await createServerSupabaseClient();

  // סקופ: המאמן חייב להיות משויך לקבוצה בעונה (הגנת דיוק לתשלום).
  const { data: assignment } = await supabase
    .from("team_coaches")
    .select("id")
    .eq("coach_id", coachId)
    .eq("team_id", parsed.data.teamId)
    .eq("season_id", parsed.data.seasonId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!assignment) {
    return { error: "אינך משויך לקבוצה זו בעונה הנוכחית." };
  }

  const { error } = await supabase.from("training_sessions").insert({
    club_id: user.club_id,
    season_id: parsed.data.seasonId,
    team_id: parsed.data.teamId,
    coach_id: coachId,
    title: parsed.data.title,
    scheduled_at: new Date(parsed.data.scheduledAt).toISOString(),
    status: "scheduled",
    created_by: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/tenant", "layout");
  return { error: null };
}

/** התחלת אימון: snapshot של הסגל (כולם "הגיע"), ומעבר ל-in_progress. */
export async function startTrainingAction(formData: FormData): Promise<void> {
  const sessionId = z.string().uuid().parse(formData.get("sessionId"));
  const { supabase, session } = await authorizeTrainingEdit(sessionId);
  if (session.status !== "scheduled") {
    throw new Error("ניתן להתחיל רק אימון מתוזמן");
  }

  const { data: roster } = await supabase
    .from("team_players")
    .select("player_id, club_id")
    .eq("team_id", session.team_id)
    .eq("season_id", session.season_id)
    .is("deleted_at", null);

  const rows = (roster ?? []) as { player_id: string; club_id: string }[];
  if (rows.length > 0) {
    const { error: attError } = await supabase
      .from("training_attendance")
      .upsert(
        rows.map((r) => ({
          club_id: r.club_id,
          training_session_id: sessionId,
          player_id: r.player_id,
          status: "present" as const,
        })),
        { onConflict: "training_session_id,player_id", ignoreDuplicates: true },
      );
    if (attError) throw new Error(attError.message);
  }

  const { error } = await supabase
    .from("training_sessions")
    .update({ status: "in_progress", started_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) throw new Error(error.message);

  revalidatePath("/tenant", "layout");
}

/** סימון נוכחות לשחקן (present/absent). */
export async function setAttendanceAction(formData: FormData): Promise<void> {
  const parsed = z
    .object({
      sessionId: z.string().uuid(),
      playerId: z.string().uuid(),
      status: z.enum(["present", "absent"]),
    })
    .parse({
      sessionId: formData.get("sessionId"),
      playerId: formData.get("playerId"),
      status: formData.get("status"),
    });

  const { supabase, session } = await authorizeTrainingEdit(parsed.sessionId);
  if (session.status === "scheduled") {
    throw new Error("יש להתחיל את האימון לפני סימון נוכחות");
  }

  const { error } = await supabase
    .from("training_attendance")
    .update({ status: parsed.status })
    .eq("training_session_id", parsed.sessionId)
    .eq("player_id", parsed.playerId);
  if (error) throw new Error(error.message);

  revalidatePath("/tenant", "layout");
}

/** סיום אימון: הערות (אירוע חריג) + מעבר ל-completed. */
export async function endTrainingAction(formData: FormData): Promise<void> {
  const parsed = z
    .object({
      sessionId: z.string().uuid(),
      notes: z
        .string()
        .trim()
        .optional()
        .transform((v) => (v ? v : null)),
    })
    .parse({
      sessionId: formData.get("sessionId"),
      notes: formData.get("notes"),
    });

  const { supabase, session } = await authorizeTrainingEdit(parsed.sessionId);
  if (session.status !== "in_progress") {
    throw new Error("ניתן לסיים רק אימון שמתקיים");
  }

  const { error } = await supabase
    .from("training_sessions")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
      notes: parsed.notes,
    })
    .eq("id", parsed.sessionId);
  if (error) throw new Error(error.message);

  revalidatePath("/tenant", "layout");
}

/** ביטול אימון (מתוזמן/מתקיים). */
export async function cancelTrainingAction(formData: FormData): Promise<void> {
  const sessionId = z.string().uuid().parse(formData.get("sessionId"));
  const { supabase, session } = await authorizeTrainingEdit(sessionId);
  if (session.status === "completed") {
    throw new Error("לא ניתן לבטל אימון שהושלם");
  }

  const { error } = await supabase
    .from("training_sessions")
    .update({ status: "cancelled" })
    .eq("id", sessionId);
  if (error) throw new Error(error.message);

  revalidatePath("/tenant", "layout");
}
