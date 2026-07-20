import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/ui/form-dialog";
import { getCurrentPermissions } from "@/features/tenant-auth";
import { getSelectedSeason } from "@/features/seasons";
import { listTeams } from "@/features/teams";
import { TeamList } from "@/features/teams/team-list";
import { CreateTeamForm } from "@/features/teams/create-team-form";

export default async function TeamsPage() {
  const perms = await getCurrentPermissions();
  const season = await getSelectedSeason();

  if (!season) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-text-primary text-xl font-bold">קבוצות</h1>
        <p className="text-text-muted text-sm">
          אין עונה.{" "}
          <Link href="/seasons" className="text-primary-500 hover:underline">
            צור עונה
          </Link>{" "}
          כדי לנהל קבוצות.
        </p>
      </div>
    );
  }

  const canCreate = season.is_active && perms.has("teams.manage");
  const teams = await listTeams(season.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-text-primary text-xl font-bold">קבוצות</h1>
        <div className="flex items-center gap-3">
          <span className="text-text-muted text-sm">עונה: {season.name}</span>
          {canCreate ? (
            <FormDialog triggerLabel="+ קבוצה" title="קבוצה חדשה">
              <CreateTeamForm seasonId={season.id} />
            </FormDialog>
          ) : (
            !perms.has("teams.manage") && (
              <Badge variant="muted">צפייה בלבד</Badge>
            )
          )}
        </div>
      </div>
      <TeamList teams={teams} />
    </div>
  );
}
