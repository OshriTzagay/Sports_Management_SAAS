import { cn } from "@/lib/utils";

/** טבעת טעינה — יורשת צבע (currentColor) וגודל מההקשר. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="טוען"
      className={cn(
        "inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}
