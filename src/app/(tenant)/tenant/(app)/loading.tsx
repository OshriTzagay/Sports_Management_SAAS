import { Skeleton } from "@/components/ui/skeleton";

/** שלד טעינה כללי בצורת דף רשימה — כותרת, פעולה, וטבלה. */
export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-28" />
      </div>

      <Skeleton className="h-10 w-full max-w-sm" />

      <div className="border-border bg-bg-surface overflow-hidden rounded-lg border">
        <div className="border-border flex items-center gap-4 border-b p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3.5 flex-1" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, row) => (
          <div
            key={row}
            className="border-border/60 flex items-center gap-4 border-b p-4 last:border-b-0"
          >
            {Array.from({ length: 5 }).map((_, col) => (
              <Skeleton key={col} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
