import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/ui/form-dialog";
import { requireUser } from "@/features/tenant-auth";
import { getSelectedSeason } from "@/features/seasons";
import { listTeams } from "@/features/teams";
import { listPlayers, listSeasonAssignments } from "@/features/players";
import { PlayerList } from "@/features/players/player-list";
import { CreatePlayerForm } from "@/features/players/create-player-form";

export default async function PlayersPage() {
  await requireUser();

  const [season, players] = await Promise.all([
    getSelectedSeason(),
    listPlayers(),
  ]);

  const readOnly = season ? !season.is_active : false;

  const [teams, assignments] = season
    ? await Promise.all([
        listTeams(season.id),
        listSeasonAssignments(season.id),
      ])
    : [[], []];

  const teamByPlayer = Object.fromEntries(
    assignments.map((a) => [a.player_id, a.team_id]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-text-primary text-xl font-bold">שחקנים</h1>
        <div className="flex items-center gap-3">
          {season && (
            <span className="text-text-muted text-sm">עונה: {season.name}</span>
          )}
          {readOnly ? (
            <Badge variant="muted">צפייה בלבד</Badge>
          ) : (
            <FormDialog triggerLabel="+ שחקן" title="שחקן חדש">
              <CreatePlayerForm />
            </FormDialog>
          )}
        </div>
      </div>

      {!season && (
        <p className="text-text-muted text-sm">
          אין עונה — ניתן לנהל זהות שחקנים, אך השיבוץ לקבוצה יתאפשר לאחר יצירת
          עונה.
        </p>
      )}

      <PlayerList
        players={players}
        seasonId={readOnly ? null : (season?.id ?? null)}
        teams={teams}
        teamByPlayer={teamByPlayer}
        readOnly={readOnly}
      />
    </div>
  );
}
