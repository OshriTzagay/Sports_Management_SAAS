import { cn } from "@/lib/utils";

/** Metric card לפי design-system: רקע muted, ללא גבול, תווית למעלה ומספר גדול. */
export function MetricCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number | string;
  className?: string;
}) {
  return (
    <div className={cn("bg-bg-muted rounded-md p-4", className)}>
      <p className="text-text-muted text-[13px]">{label}</p>
      <p className="text-text-primary mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
