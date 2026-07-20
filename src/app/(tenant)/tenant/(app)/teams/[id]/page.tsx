import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { requireUser, getUserPermissions } from "@/features/tenant-auth";
import { getTeam } from "@/features/teams";
import { listTeamRoster } from "@/features/players";
import { TeamEditButton } from "@/features/teams/team-edit-button";
import { TeamSquad } from "@/features/teams/team-squad";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const perms = await getUserPermissions(user);
  if (!perms.has("teams.view")) notFound();

  const team = await getTeam(id);
  if (!team) notFound();

  const canManage = perms.has("teams.manage");
  const roster = await listTeamRoster(team.id, team.season_id);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/teams"
          className="text-text-muted hover:text-text-primary flex w-fit items-center gap-1 text-sm"
        >
          <ChevronRight className="size-4" />
          חזרה לקבוצות
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-text-primary text-2xl font-bold">
              {team.name}
            </h1>
            <span className="text-text-muted text-sm">
              {team.age_category ? `${team.age_category} · ` : ""}
              {roster.length} שחקנים בסגל
            </span>
          </div>
          {canManage && <TeamEditButton team={team} />}
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-text-primary text-sm font-bold">סגל הקבוצה</h2>
        <TeamSquad players={roster} />
      </section>
    </div>
  );
}
