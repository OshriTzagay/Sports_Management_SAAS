import Link from "next/link";

import { FormDialog } from "@/components/ui/form-dialog";
import { requireUser } from "@/features/tenant-auth";
import { getActiveSeason } from "@/features/seasons";
import { listTeams } from "@/features/teams";
import { TeamList } from "@/features/teams/team-list";
import { CreateTeamForm } from "@/features/teams/create-team-form";

export default async function TeamsPage() {
  await requireUser();
  const activeSeason = await getActiveSeason();

  if (!activeSeason) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-text-primary text-xl font-bold">קבוצות</h1>
        <p className="text-text-muted text-sm">
          אין עונה פעילה.{" "}
          <Link href="/seasons" className="text-primary-500 hover:underline">
            צור והפעל עונה
          </Link>{" "}
          כדי לנהל קבוצות.
        </p>
      </div>
    );
  }

  const teams = await listTeams(activeSeason.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-text-primary text-xl font-bold">קבוצות</h1>
        <div className="flex items-center gap-3">
          <span className="text-text-muted text-sm">
            עונה: {activeSeason.name}
          </span>
          <FormDialog triggerLabel="+ קבוצה" title="קבוצה חדשה">
            <CreateTeamForm seasonId={activeSeason.id} />
          </FormDialog>
        </div>
      </div>
      <TeamList teams={teams} />
    </div>
  );
}
