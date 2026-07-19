import "server-only";

import { requireUser } from "@/features/tenant-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AttendanceRow,
  AttendanceStatus,
  CoachTeam,
  TrainingSession,
  TrainingStatus,
} from "./types";

/** כרטיס המאמן המקושר למשתמש המחובר (person_type='coach'), או null. */
export async function getMyCoachId(): Promise<string | null> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("users")
    .select("person_type, person_id")
    .eq("id", user.id)
    .maybeSingle();
  const row = data as {
    person_type: string | null;
    person_id: string | null;
  } | null;
  return row?.person_type === "coach" ? row.person_id : null;
}

type RawTeamRel = { name: string } | { name: string }[] | null;
function teamName(rel: RawTeamRel): string | null {
  const team = Array.isArray(rel) ? rel[0] : rel;
  return team?.name ?? null;
}

/** הקבוצות שהמאמן משויך אליהן בעונה (מ-team_coaches). */
export async function listCoachTeams(
  coachId: string,
  seasonId: string,
): Promise<CoachTeam[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("team_coaches")
    .select("team_id, teams(name)")
    .eq("coach_id", coachId)
    .eq("season_id", seasonId)
    .is("deleted_at", null);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as {
    team_id: string;
    teams: RawTeamRel;
  }[];
  return rows.map((r) => ({
    team_id: r.team_id,
    team_name: teamName(r.teams) ?? "—",
  }));
}

type RawSession = {
  id: string;
  season_id: string;
  team_id: string;
  coach_id: string;
  title: string | null;
  scheduled_at: string;
  status: TrainingStatus;
  started_at: string | null;
  ended_at: string | null;
  notes: string | null;
  teams: RawTeamRel;
};

/** מרכיב ספירות נוכחות (present/total) ומצרף גודל סגל לאימונים שטרם התחילו. */
async function withCounts(
  rows: RawSession[],
  seasonId: string,
): Promise<TrainingSession[]> {
  const supabase = await createServerSupabaseClient();
  const sessionIds = rows.map((r) => r.id);

  const present: Record<string, number> = {};
  const total: Record<string, number> = {};
  if (sessionIds.length > 0) {
    const { data: att } = await supabase
      .from("training_attendance")
      .select("training_session_id, status")
      .in("training_session_id", sessionIds);
    for (const a of (att ?? []) as {
      training_session_id: string;
      status: AttendanceStatus;
    }[]) {
      total[a.training_session_id] = (total[a.training_session_id] ?? 0) + 1;
      if (a.status === "present") {
        present[a.training_session_id] =
          (present[a.training_session_id] ?? 0) + 1;
      }
    }
  }

  // גודל סגל לקבוצות של אימונים שטרם התחילו (אין עדיין שורות נוכחות).
  const roster: Record<string, number> = {};
  const teamIds = [...new Set(rows.map((r) => r.team_id))];
  if (teamIds.length > 0) {
    const { data: tp } = await supabase
      .from("team_players")
      .select("team_id")
      .eq("season_id", seasonId)
      .in("team_id", teamIds)
      .is("deleted_at", null);
    for (const p of (tp ?? []) as { team_id: string }[]) {
      roster[p.team_id] = (roster[p.team_id] ?? 0) + 1;
    }
  }

  return rows.map((r) => ({
    id: r.id,
    season_id: r.season_id,
    team_id: r.team_id,
    team_name: teamName(r.teams),
    coach_id: r.coach_id,
    title: r.title,
    scheduled_at: r.scheduled_at,
    status: r.status,
    started_at: r.started_at,
    ended_at: r.ended_at,
    notes: r.notes,
    present_count: present[r.id] ?? 0,
    roster_count: total[r.id] ?? roster[r.team_id] ?? 0,
  }));
}

const SESSION_COLUMNS =
  "id, season_id, team_id, coach_id, title, scheduled_at, status, started_at, ended_at, notes, teams(name)";

/** אימוני מאמן בעונה (למסך המאמן). */
export async function listTrainingsForCoach(
  coachId: string,
  seasonId: string,
): Promise<TrainingSession[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("training_sessions")
    .select(SESSION_COLUMNS)
    .eq("coach_id", coachId)
    .eq("season_id", seasonId)
    .is("deleted_at", null)
    .order("scheduled_at", { ascending: false });
  if (error) throw new Error(error.message);
  return withCounts((data ?? []) as unknown as RawSession[], seasonId);
}

/** כל אימוני העונה (כל המאמנים) — למסך המנהל, מקובץ אח"כ לפי מאמן. */
export async function listSeasonTrainings(
  seasonId: string,
): Promise<TrainingSession[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("training_sessions")
    .select(SESSION_COLUMNS)
    .eq("season_id", seasonId)
    .is("deleted_at", null)
    .order("scheduled_at", { ascending: false });
  if (error) throw new Error(error.message);
  return withCounts((data ?? []) as unknown as RawSession[], seasonId);
}

/** כל אימוני מאמן (לכל העונות) — למסך המנהל/תשלום. */
export async function listTrainingsByCoach(
  coachId: string,
): Promise<TrainingSession[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("training_sessions")
    .select(SESSION_COLUMNS)
    .eq("coach_id", coachId)
    .is("deleted_at", null)
    .order("scheduled_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as RawSession[];
  // ספירות: לכל אימון, לפי העונה שלו (רוב האימונים כבר התחילו → total מהנוכחות).
  return withCounts(rows, rows[0]?.season_id ?? "");
}

/** אימון בודד (עם שם קבוצה). */
export async function getTraining(
  sessionId: string,
): Promise<TrainingSession | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("training_sessions")
    .select(SESSION_COLUMNS)
    .eq("id", sessionId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const [session] = await withCounts(
    [data as unknown as RawSession],
    (data as unknown as RawSession).season_id,
  );
  return session ?? null;
}

/** נוכחות לאימון (שורות שנוצרו בהתחלה), ממוינת לפי שם. */
export async function listAttendance(
  sessionId: string,
): Promise<AttendanceRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("training_attendance")
    .select("player_id, status, players(first_name, last_name)")
    .eq("training_session_id", sessionId);
  if (error) throw new Error(error.message);

  type RawAtt = {
    player_id: string;
    status: AttendanceStatus;
    players:
      | { first_name: string; last_name: string }
      | { first_name: string; last_name: string }[]
      | null;
  };
  const rows = (data ?? []) as unknown as RawAtt[];
  return rows
    .map((r) => {
      const p = Array.isArray(r.players) ? r.players[0] : r.players;
      return {
        player_id: r.player_id,
        first_name: p?.first_name ?? "",
        last_name: p?.last_name ?? "",
        status: r.status,
      };
    })
    .sort((a, b) =>
      `${a.first_name} ${a.last_name}`.localeCompare(
        `${b.first_name} ${b.last_name}`,
        "he",
      ),
    );
}
