import { cn } from "@/lib/utils";

/** אלמנט placeholder בפעימה — לבניית שלדי טעינה (loading skeletons). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-bg-muted animate-pulse rounded-md", className)} />
  );
}
