import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/ui/form-dialog";
import { requireUser, getUserPermissions } from "@/features/tenant-auth";
import { getSelectedSeason } from "@/features/seasons";
import {
  getMyCoachId,
  listCoachTeams,
  listTrainingsForCoach,
  TRAINING_STATUS_LABELS,
  type TrainingSession,
} from "@/features/trainings";
import { CreateTrainingForm } from "@/features/trainings/create-training-form";

const STATUS_VARIANT: Record<
  TrainingSession["status"],
  "info" | "success" | "muted" | "danger"
> = {
  scheduled: "info",
  in_progress: "success",
  completed: "muted",
  cancelled: "danger",
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("he-IL")} · ${d.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default async function TrainingsPage() {
  const user = await requireUser();
  const perms = await getUserPermissions(user);
  const coachId = await getMyCoachId();

  const canManage = perms.has("trainings.manage") && coachId !== null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-text-primary text-xl font-bold">אימונים</h1>
      </div>

      {coachId === null ? (
        <p className="text-text-muted text-sm">
          מסך זה מיועד למאמנים. חשבונך אינו מקושר לכרטיס מאמן — פנה למנהל
          המועדון.
        </p>
      ) : (
        <TrainingsContent coachId={coachId} canManage={canManage} />
      )}
    </div>
  );
}

async function TrainingsContent({
  coachId,
  canManage,
}: {
  coachId: string;
  canManage: boolean;
}) {
  const season = await getSelectedSeason();
  if (!season) {
    return <p className="text-text-muted text-sm">אין עונה פעילה.</p>;
  }

  const [teams, trainings] = await Promise.all([
    listCoachTeams(coachId, season.id),
    listTrainingsForCoach(coachId, season.id),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-text-muted text-sm">עונה: {season.name}</span>
        {canManage && teams.length > 0 && (
          <FormDialog triggerLabel="+ אימון חדש" title="אימון חדש">
            <CreateTrainingForm teams={teams} seasonId={season.id} />
          </FormDialog>
        )}
      </div>

      {teams.length === 0 && (
        <p className="text-text-muted text-sm">
          אינך משויך לקבוצה בעונה זו — פנה למנהל כדי לשייך אותך לקבוצה.
        </p>
      )}

      {trainings.length === 0 ? (
        <p className="text-text-muted text-sm">עדיין אין אימונים.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {trainings.map((t) => (
            <li key={t.id}>
              <Link
                href={`/trainings/${t.id}`}
                className="border-border bg-bg-surface hover:bg-bg-muted/50 flex items-center gap-3 rounded-lg border p-4 transition-colors"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary truncate font-medium">
                      {t.team_name ?? "—"}
                    </span>
                    <Badge variant={STATUS_VARIANT[t.status]}>
                      {TRAINING_STATUS_LABELS[t.status]}
                    </Badge>
                  </div>
                  <span className="text-text-muted text-xs">
                    {formatWhen(t.scheduled_at)}
                    {t.title ? ` · ${t.title}` : ""}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <span className="text-text-primary text-sm font-medium">
                    {t.present_count}/{t.roster_count}
                  </span>
                  <span className="text-text-muted text-[0.65rem]">נוכחות</span>
                </div>
                <ChevronLeft className="text-text-muted size-4 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
