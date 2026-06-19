import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface ClubStats {
  activePlayers: number;
  teams: number;
  activeCoaches: number;
  assignedPlayers: number;
}

type Supabase = Awaited<ReturnType<typeof createServerSupabaseClient>>;

async function countActive(
  supabase: Supabase,
  table: string,
  filters: Record<string, string>,
): Promise<number> {
  let query = supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);
  for (const [column, value] of Object.entries(filters)) {
    query = query.eq(column, value);
  }
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** מטריקות מצרפיות לדשבורד המועדון (RLS מסנן ל-club_id). */
export async function getClubStats(
  activeSeasonId: string | null,
): Promise<ClubStats> {
  const supabase = await createServerSupabaseClient();

  const [activePlayers, activeCoaches, teams, assignedPlayers] =
    await Promise.all([
      countActive(supabase, "players", { status: "active" }),
      countActive(supabase, "coaches", { status: "active" }),
      activeSeasonId
        ? countActive(supabase, "teams", { season_id: activeSeasonId })
        : Promise.resolve(0),
      activeSeasonId
        ? countActive(supabase, "team_players", { season_id: activeSeasonId })
        : Promise.resolve(0),
    ]);

  return { activePlayers, teams, activeCoaches, assignedPlayers };
}
