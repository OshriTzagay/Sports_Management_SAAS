import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Coach, CoachAssignment, CoachRole } from "./types";

interface RawAssignment {
  id: string;
  coach_id: string;
  team_id: string;
  role: CoachRole;
  // ה-client הלא-מטויפס מסיק מערך עבור היחס; ב-runtime זה אובייקט (to-one).
  teams: { name: string } | { name: string }[] | null;
}

function teamName(teams: RawAssignment["teams"]): string {
  if (!teams) return "";
  return Array.isArray(teams) ? (teams[0]?.name ?? "") : teams.name;
}

/** כל מאמני המועדון (זהות — לא תלוי עונה). RLS מסנן ל-club_id. */
export async function listCoaches(): Promise<Coach[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("coaches")
    .select(
      "id, club_id, first_name, last_name, phone, certification, license_expiry, status, created_at",
    )
    .is("deleted_at", null)
    .order("last_name");

  if (error) throw new Error(error.message);
  return (data as Coach[] | null) ?? [];
}

/** מאמן בודד לפי מזהה (זהות). */
export async function getCoach(coachId: string): Promise<Coach | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("coaches")
    .select(
      "id, club_id, first_name, last_name, phone, certification, license_expiry, status, created_at",
    )
    .eq("id", coachId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Coach | null) ?? null;
}

/** שיוכי המאמנים לקבוצות בעונה נתונה (כולל שם הקבוצה). */
export async function listSeasonCoachAssignments(
  seasonId: string,
): Promise<CoachAssignment[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("team_coaches")
    .select("id, coach_id, team_id, role, teams(name)")
    .eq("season_id", seasonId)
    .is("deleted_at", null);

  if (error) throw new Error(error.message);
  return ((data as unknown as RawAssignment[] | null) ?? []).map((row) => ({
    id: row.id,
    coach_id: row.coach_id,
    team_id: row.team_id,
    role: row.role,
    team_name: teamName(row.teams),
  }));
}
