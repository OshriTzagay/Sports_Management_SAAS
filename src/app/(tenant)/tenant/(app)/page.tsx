import { MetricCard } from "@/components/ui/metric-card";
import { requireUser } from "@/features/tenant-auth";
import { getActiveSeason } from "@/features/seasons";
import { getClubStats } from "@/features/dashboard";

export default async function TenantDashboard() {
  await requireUser();
  const activeSeason = await getActiveSeason();
  const stats = await getClubStats(activeSeason?.id ?? null);

  const unassigned = Math.max(stats.activePlayers - stats.assignedPlayers, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-text-primary text-xl font-bold">לוח הבקרה</h1>
        <span className="text-text-muted text-sm">
          עונה פעילה: {activeSeason?.name ?? "—"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="שחקנים פעילים" value={stats.activePlayers} />
        <MetricCard label="קבוצות בעונה" value={stats.teams} />
        <MetricCard label="מאמנים פעילים" value={stats.activeCoaches} />
        <MetricCard label="שחקנים ללא שיבוץ" value={unassigned} />
      </div>

      {!activeSeason && (
        <p className="text-text-muted text-sm">
          אין עונה פעילה — חלק מהמדדים יתעדכנו לאחר הפעלת עונה.
        </p>
      )}
    </div>
  );
}
