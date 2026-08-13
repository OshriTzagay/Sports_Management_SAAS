import { Skeleton } from "@/components/ui/skeleton";

/** שלד טעינה בצורת דף רשימה — כותרת, סרגל כלים וטבלה (תואם ל-DataTable). */
const COLUMN_WIDTHS = ["w-32", "w-44", "w-24", "w-20"];

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      {/* כותרת + פעולה */}
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* סרגל כלים: חיפוש, פילטר, מונה */}
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="ms-auto h-3 w-16" />
      </div>

      {/* טבלה */}
      <div className="border-border bg-bg-surface overflow-hidden rounded-lg border">
        <div className="border-border bg-bg-muted/40 flex items-center gap-4 border-b px-4 py-3">
          {COLUMN_WIDTHS.map((w, i) => (
            <Skeleton key={i} className={`h-3.5 ${w}`} />
          ))}
          <Skeleton className="ms-auto h-3.5 w-14" />
        </div>

        {Array.from({ length: 7 }).map((_, row) => (
          <div
            key={row}
            className="border-border/60 flex items-center gap-4 border-b px-4 py-3.5 last:border-b-0"
          >
            {COLUMN_WIDTHS.map((w, i) => (
              <Skeleton key={i} className={`h-4 ${w}`} />
            ))}
            <Skeleton className="ms-auto h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
