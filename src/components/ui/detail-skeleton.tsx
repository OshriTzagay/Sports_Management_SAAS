import { Skeleton } from "./skeleton";

/** שלד טעינה לדף פירוט (מאמן/קבוצה) — כותרת עם אווטאר, כרטיסי מדד וסקשנים. */
export function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>

      <Skeleton className="h-44 w-full rounded-lg" />
      <Skeleton className="h-44 w-full rounded-lg" />
    </div>
  );
}
