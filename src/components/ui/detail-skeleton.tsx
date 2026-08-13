import { Skeleton } from "./skeleton";

/** שלד טעינה לדף פירוט (מאמן/קבוצה) — קישור חזרה, כותרת עם סטטוס, ומטא + סקשנים. */
export function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* קישור חזרה */}
      <Skeleton className="h-4 w-28" />

      {/* כותרת + סטטוס + שורת מטא */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>

      {/* סקשן ראשון — כרטיס */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-44" />
        <div className="border-border bg-bg-surface rounded-lg border p-4">
          <Skeleton className="h-20 w-full" />
        </div>
      </div>

      {/* סקשן שני — טבלה */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <div className="border-border bg-bg-surface overflow-hidden rounded-lg border">
          {Array.from({ length: 4 }).map((_, row) => (
            <div
              key={row}
              className="border-border/60 flex items-center gap-4 border-b px-4 py-3.5 last:border-b-0"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="ms-auto h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
