import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getCurrentPermissions } from "@/features/tenant-auth";
import { getSelectedSeason } from "@/features/seasons";
import { listTeams, type Team } from "@/features/teams";
import {
  getPlayer,
  listSeasonAssignments,
  calculateAge,
  isMinor,
  PLAYER_STATUS_LABELS,
  type PlayerStatus,
  type SeasonAssignment,
} from "@/features/players";
import { listContacts, listPlayerContacts } from "@/features/contacts";
import { PlayerContacts } from "@/features/contacts/player-contacts";
import { listPlayerCharges, type Charge } from "@/features/payments";
import { PlayerStatement } from "@/features/payments/player-statement";
import { PlayerEditButton } from "@/features/players/player-edit-button";

const STATUS_VARIANT: Record<PlayerStatus, "success" | "muted" | "danger"> = {
  active: "success",
  inactive: "muted",
  left: "danger",
};

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString("he-IL") : "—";
}

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const perms = await getCurrentPermissions();
  if (!perms.has("players.view")) notFound();

  const player = await getPlayer(id);
  if (!player) notFound();

  const canManage = perms.has("players.manage");
  const canViewPayments = perms.has("payments.view");
  const season = await getSelectedSeason();
  const activeManage = canManage && season?.is_active === true;

  const [teams, assignments, contacts, contactLinks, charges] =
    await Promise.all([
      season ? listTeams(season.id) : Promise.resolve<Team[]>([]),
      season
        ? listSeasonAssignments(season.id)
        : Promise.resolve<SeasonAssignment[]>([]),
      listContacts(),
      listPlayerContacts(),
      canViewPayments ? listPlayerCharges(id) : Promise.resolve<Charge[]>([]),
    ]);

  const currentTeamId =
    assignments.find((a) => a.player_id === id)?.team_id ?? null;
  const teamName = teams.find((t) => t.id === currentTeamId)?.name ?? null;
  const playerLinks = contactLinks.filter((l) => l.player_id === id);
  const age = calculateAge(player.birth_date);
  const minor = isMinor(player.birth_date);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/players"
        className="text-text-muted hover:text-text-primary flex w-fit items-center gap-1 text-sm"
      >
        <ChevronRight className="size-4" />
        חזרה לשחקנים
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-text-primary text-2xl font-bold">
              {player.first_name} {player.last_name}
            </h1>
            <Badge variant={STATUS_VARIANT[player.status]}>
              {PLAYER_STATUS_LABELS[player.status]}
            </Badge>
            {minor && <Badge variant="info">קטין</Badge>}
          </div>
          <div className="text-text-muted flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span>ת.ז: {player.national_id ?? "—"}</span>
            <span>טלפון: {player.phone ?? "—"}</span>
            <span>אימייל: {player.email ?? "—"}</span>
            <span>
              תאריך לידה: {formatDate(player.birth_date)}
              {age !== null ? ` (גיל ${age})` : ""}
            </span>
            <span>הצטרפות: {formatDate(player.created_at)}</span>
            <span>קבוצה: {teamName ?? "—"}</span>
          </div>
        </div>
        {activeManage && (
          <PlayerEditButton
            player={player}
            seasonId={season?.id ?? null}
            teams={teams}
            currentTeamId={currentTeamId}
          />
        )}
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-text-primary text-sm font-bold">אנשי קשר</h2>
        <div className="border-border bg-bg-surface rounded-lg border p-4">
          <PlayerContacts
            playerId={player.id}
            links={playerLinks}
            contacts={contacts}
            isMinor={minor}
          />
        </div>
      </section>

      {canViewPayments && (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-primary text-sm font-bold">כרטסת פיננסית</h2>
          <PlayerStatement charges={charges} />
        </section>
      )}
    </div>
  );
}
