import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/ui/form-dialog";
import { getCurrentPermissions } from "@/features/tenant-auth";
import { getSelectedSeason } from "@/features/seasons";
import { listTeams } from "@/features/teams";
import { listCoaches, listSeasonCoachAssignments } from "@/features/coaches";
import type { CoachAssignment } from "@/features/coaches";
import { CoachList } from "@/features/coaches/coach-list";
import { CreateCoachForm } from "@/features/coaches/create-coach-form";

export default async function CoachesPage() {
  const perms = await getCurrentPermissions();

  const [season, coaches] = await Promise.all([
    getSelectedSeason(),
    listCoaches(),
  ]);

  const readOnly =
    (season ? !season.is_active : false) || !perms.has("coaches.manage");

  const [teams, assignments] = season
    ? await Promise.all([
        listTeams(season.id),
        listSeasonCoachAssignments(season.id),
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
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-text-primary text-xl font-bold">מאמנים</h1>
        <div className="flex items-center gap-3">
          {season && (
            <span className="text-text-muted text-sm">עונה: {season.name}</span>
          )}
          {readOnly ? (
            <Badge variant="muted">צפייה בלבד</Badge>
          ) : (
            <FormDialog triggerLabel="+ מאמן" title="מאמן חדש">
              <CreateCoachForm />
            </FormDialog>
          )}
        </div>
      </div>

      <CoachList
        coaches={coaches}
        seasonId={readOnly ? null : (season?.id ?? null)}
        teams={teams}
        assignmentsByCoach={assignmentsByCoach}
        readOnly={readOnly}
      />
    </div>
  );
}
