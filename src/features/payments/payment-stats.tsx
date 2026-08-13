import { AlertTriangle, Clock, TrendingUp, Wallet } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatAgorot } from "./types";
import type { PaymentStats } from "./stats";

type Accent = "neutral" | "success" | "warning" | "danger";

const ICON_CLASS: Record<Accent, string> = {
  neutral: "bg-bg-muted text-text-muted",
  success: "bg-success-bg text-success-text",
  warning: "bg-warning-bg text-warning-text",
  danger: "bg-danger-bg text-danger-text",
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Wallet;
  accent?: Accent;
}) {
  return (
    <Card className="flex items-start gap-3 p-4">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md",
          ICON_CLASS[accent],
        )}
      >
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0">
        <p className="text-text-muted text-[13px]">{label}</p>
        <p className="text-text-primary mt-0.5 text-xl font-bold">{value}</p>
        {hint && <p className="text-text-muted mt-0.5 text-xs">{hint}</p>}
      </div>
    </Card>
  );
}

/** שורת כרטיסי KPI פיננסיים למסך התשלומים. */
export function PaymentStatsRow({
  stats,
  currency,
}: {
  stats: PaymentStats;
  currency: string;
}) {
  const collectionRate =
    stats.totalBilledAgorot > 0
      ? Math.round((stats.collectedAgorot / stats.totalBilledAgorot) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label='סה"כ חויב'
        value={formatAgorot(stats.totalBilledAgorot, currency)}
        icon={Wallet}
      />
      <StatCard
        label="נגבה"
        value={formatAgorot(stats.collectedAgorot, currency)}
        hint={`${collectionRate}% מהחיובים`}
        icon={TrendingUp}
        accent="success"
      />
      <StatCard
        label="יתרה לגבייה"
        value={formatAgorot(stats.outstandingAgorot, currency)}
        hint={`${stats.openCount} חיובים פתוחים`}
        icon={Clock}
        accent={stats.outstandingAgorot > 0 ? "warning" : "neutral"}
      />
      <StatCard
        label="באיחור"
        value={String(stats.overdueCount)}
        hint="חיובים שעברו תאריך יעד"
        icon={AlertTriangle}
        accent={stats.overdueCount > 0 ? "danger" : "neutral"}
      />
    </div>
  );
}
