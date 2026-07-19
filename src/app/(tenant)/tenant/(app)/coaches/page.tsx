import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/ui/form-dialog";
import { getCurrentPermissions } from "@/features/tenant-auth";
import { getSelectedSeason } from "@/features/seasons";
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

  const canCreate = season?.is_active === true && perms.has("coaches.manage");

  const assignments = season ? await listSeasonCoachAssignments(season.id) : [];

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
          {canCreate ? (
            <FormDialog triggerLabel="+ מאמן" title="מאמן חדש">
              <CreateCoachForm />
            </FormDialog>
          ) : (
            !perms.has("coaches.manage") && (
              <Badge variant="muted">צפייה בלבד</Badge>
            )
          )}
        </div>
      </div>

      <CoachList coaches={coaches} assignmentsByCoach={assignmentsByCoach} />
    </div>
  );
}
