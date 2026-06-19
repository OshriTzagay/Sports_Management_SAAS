import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/features/tenant-auth";
import { getActiveSeason } from "@/features/seasons";
import { listTeams } from "@/features/teams";
import { listCoaches, listSeasonCoachAssignments } from "@/features/coaches";
import type { CoachAssignment } from "@/features/coaches";
import { CoachList } from "@/features/coaches/coach-list";
import { CreateCoachForm } from "@/features/coaches/create-coach-form";

export default async function CoachesPage() {
  await requireUser();

  const [activeSeason, coaches] = await Promise.all([
    getActiveSeason(),
    listCoaches(),
  ]);

  const [teams, assignments] = activeSeason
    ? await Promise.all([
        listTeams(activeSeason.id),
        listSeasonCoachAssignments(activeSeason.id),
      ])
    : [[], []];

  const assignmentsByCoach = assignments.reduce<
    Record<string, CoachAssignment[]>
  >((acc, a) => {
    (acc[a.coach_id] ??= []).push(a);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-text-primary text-xl font-bold">מאמנים</h1>
        {activeSeason && (
          <span className="text-text-muted text-sm">
            שיוך לעונה: {activeSeason.name}
          </span>
        )}
      </div>

      <CoachList
        coaches={coaches}
        seasonId={activeSeason?.id ?? null}
        teams={teams}
        assignmentsByCoach={assignmentsByCoach}
      />

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">הוספת מאמן</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateCoachForm />
        </CardContent>
      </Card>
    </div>
  );
}
