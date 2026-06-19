import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="flex items-center justify-between">
        <h1 className="text-text-primary text-xl font-bold">קבוצות</h1>
        <span className="text-text-muted text-sm">
          עונה: {activeSeason.name}
        </span>
      </div>
      <TeamList teams={teams} />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">הוספת קבוצה</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateTeamForm seasonId={activeSeason.id} />
        </CardContent>
      </Card>
    </div>
  );
}
