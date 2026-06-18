import * as React from "react";

import { cn } from "@/lib/utils";

/** Input לפי design-system.md: גובה ~40px, radius-md, focus ring ב-primary-300. */
export function Input({
  className,
  type,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-border bg-bg-surface text-text-primary flex h-10 w-full rounded-md border px-3 py-2.5 text-sm transition-colors outline-none",
        "placeholder:text-text-muted",
        "focus-visible:border-primary-300 focus-visible:ring-primary-300/40 focus-visible:ring-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-danger aria-invalid:ring-danger/20",
        className,
      )}
      {...props}
    />
  );
}
