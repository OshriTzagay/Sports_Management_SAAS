import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { requireUser, getUserPermissions } from "@/features/tenant-auth";
import { getSelectedSeason } from "@/features/seasons";
import { listTeams } from "@/features/teams";
import {
  getCoach,
  listSeasonCoachAssignments,
  COACH_STATUS_LABELS,
} from "@/features/coaches";
import { listTrainingsForCoach } from "@/features/trainings";
import { CoachEditButton } from "@/features/coaches/coach-edit-button";
import { CoachTeamAssignments } from "@/features/coaches/coach-team-assignments";
import { CoachTrainingsTable } from "@/features/coaches/coach-trainings-table";

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString("he-IL") : "—";
}

export default async function CoachDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const perms = await getUserPermissions(user);
  if (!perms.has("coaches.view")) notFound();

  const coach = await getCoach(id);
  if (!coach) notFound();

  const canManage = perms.has("coaches.manage");
  const season = await getSelectedSeason();
  const activeManage = canManage && season?.is_active === true;

  const [teams, assignments, trainings] = season
    ? await Promise.all([
        listTeams(season.id),
        listSeasonCoachAssignments(season.id),
        listTrainingsForCoach(coach.id, season.id),
      ])
    : [[], [], []];

  const coachAssignments = assignments.filter((a) => a.coach_id === coach.id);
  const licenseExpired =
    coach.license_expiry !== null &&
    new Date(coach.license_expiry) < new Date();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/coaches"
          className="text-text-muted hover:text-text-primary flex w-fit items-center gap-1 text-sm"
        >
          <ChevronRight className="size-4" />
          חזרה למאמנים
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-text-primary text-2xl font-bold">
                {coach.first_name} {coach.last_name}
              </h1>
              <Badge variant={coach.status === "active" ? "success" : "muted"}>
                {COACH_STATUS_LABELS[coach.status]}
              </Badge>
            </div>
            <div className="text-text-muted flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span>טלפון: {coach.phone ?? "—"}</span>
              <span>הסמכה: {coach.certification ?? "—"}</span>
              <span className={licenseExpired ? "text-danger" : undefined}>
                תוקף רישיון: {formatDate(coach.license_expiry)}
                {licenseExpired ? " (פג)" : ""}
              </span>
            </div>
          </div>
          {canManage && <CoachEditButton coach={coach} />}
        </div>
      </div>

      {activeManage && season && (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-primary text-sm font-bold">
            שיוך לקבוצות (עונה {season.name})
          </h2>
          <div className="border-border bg-bg-surface rounded-lg border p-4">
            <CoachTeamAssignments
              coachId={coach.id}
              seasonId={season.id}
              teams={teams}
              assignments={coachAssignments}
            />
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-text-primary text-sm font-bold">
          אימונים{season ? ` (עונה ${season.name})` : ""}
        </h2>
        <CoachTrainingsTable trainings={trainings} />
      </section>
    </div>
  );
}
