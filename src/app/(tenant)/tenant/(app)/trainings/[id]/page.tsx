import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { requireUser, getUserPermissions } from "@/features/tenant-auth";
import {
  getMyCoachId,
  getTraining,
  listAttendance,
  TRAINING_STATUS_LABELS,
  type TrainingSession,
} from "@/features/trainings";
import { TrainingDetail } from "@/features/trainings/training-detail";

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

export default async function TrainingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const perms = await getUserPermissions(user);
  if (!perms.has("trainings.view")) notFound();

  const [session, attendance, coachId] = await Promise.all([
    getTraining(id),
    listAttendance(id),
    getMyCoachId(),
  ]);
  if (!session) notFound();

  const isOwner = perms.has("users.manage");
  const canManage =
    perms.has("trainings.manage") &&
    (isOwner || coachId === session.coach_id) &&
    (session.status !== "completed" || isOwner);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-3">
        <Link
          href="/trainings"
          className="text-text-muted hover:text-text-primary flex w-fit items-center gap-1 text-sm"
        >
          <ChevronRight className="size-4" />
          חזרה לאימונים
        </Link>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-text-primary text-xl font-bold">
              {session.team_name ?? "אימון"}
            </h1>
            <span className="text-text-muted text-sm">
              {formatWhen(session.scheduled_at)}
              {session.title ? ` · ${session.title}` : ""}
            </span>
          </div>
          <Badge variant={STATUS_VARIANT[session.status]}>
            {TRAINING_STATUS_LABELS[session.status]}
          </Badge>
        </div>
      </div>

      <TrainingDetail
        key={session.status}
        session={session}
        attendance={attendance}
        canManage={canManage}
      />
    </div>
  );
}
