import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/features/tenant-auth";
import { getActiveSeason } from "@/features/seasons";
import { listTeams } from "@/features/teams";
import { listPlayers, listSeasonAssignments } from "@/features/players";
import { PlayerList } from "@/features/players/player-list";
import { CreatePlayerForm } from "@/features/players/create-player-form";

export default async function PlayersPage() {
  await requireUser();

  const [activeSeason, players] = await Promise.all([
    getActiveSeason(),
    listPlayers(),
  ]);

  const [teams, assignments] = activeSeason
    ? await Promise.all([
        listTeams(activeSeason.id),
        listSeasonAssignments(activeSeason.id),
      ])
    : [[], []];

  const teamByPlayer = Object.fromEntries(
    assignments.map((a) => [a.player_id, a.team_id]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-text-primary text-xl font-bold">שחקנים</h1>
        {activeSeason && (
          <span className="text-text-muted text-sm">
            שיבוץ לעונה: {activeSeason.name}
          </span>
        )}
      </div>

      {!activeSeason && (
        <p className="text-text-muted text-sm">
          אין עונה פעילה — ניתן לנהל זהות שחקנים, אך השיבוץ לקבוצה יתאפשר לאחר
          הפעלת עונה.
        </p>
      )}

      <PlayerList
        players={players}
        seasonId={activeSeason?.id ?? null}
        teams={teams}
        teamByPlayer={teamByPlayer}
      />

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">הוספת שחקן</CardTitle>
        </CardHeader>
        <CardContent>
          <CreatePlayerForm />
        </CardContent>
      </Card>
    </div>
  );
}
