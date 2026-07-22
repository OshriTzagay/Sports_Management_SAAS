import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/ui/form-dialog";
import { getCurrentPermissions } from "@/features/tenant-auth";
import { getSelectedSeason } from "@/features/seasons";
import { listTeams } from "@/features/teams";
import { listPlayers, listSeasonAssignments } from "@/features/players";
import { listContacts, listPlayerContacts } from "@/features/contacts";
import type { PlayerContactLink } from "@/features/contacts";
import { listCharges } from "@/features/payments";
import { PlayerList } from "@/features/players/player-list";
import { CreatePlayerForm } from "@/features/players/create-player-form";

export default async function PlayersPage() {
  const perms = await getCurrentPermissions();

  const [season, players, contacts, contactLinks] = await Promise.all([
    getSelectedSeason(),
    listPlayers(),
    listContacts(),
    listPlayerContacts(),
  ]);

  // מצב תשלום פר-שחקן (רק למי שרשאי לצפות בתשלומים).
  const payStatusByPlayer: Record<string, "paid" | "owes"> = {};
  if (perms.has("payments.view")) {
    for (const c of await listCharges()) {
      if (c.status === "cancelled") continue;
      const open =
        c.status === "pending" ||
        c.status === "partially_paid" ||
        c.status === "failed";
      if (open && c.amount_agorot - c.paid_agorot > 0) {
        payStatusByPlayer[c.player_id] = "owes";
      } else if (payStatusByPlayer[c.player_id] !== "owes") {
        payStatusByPlayer[c.player_id] = "paid";
      }
    }
  }

  const canManage = perms.has("players.manage");
  const readOnly = (season ? !season.is_active : false) || !canManage;

  const [teams, assignments] = season
    ? await Promise.all([
        listTeams(season.id),
        listSeasonAssignments(season.id),
      ])
    : [[], []];

  const teamByPlayer = Object.fromEntries(
    assignments.map((a) => [a.player_id, a.team_id]),
  );

  const contactsByPlayer = contactLinks.reduce<
    Record<string, PlayerContactLink[]>
  >((acc, link) => {
    (acc[link.player_id] ??= []).push(link);
    return acc;
  }, {});

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
        contacts={contacts}
        contactsByPlayer={contactsByPlayer}
        payStatusByPlayer={payStatusByPlayer}
        readOnly={readOnly}
      />
    </div>
  );
}
