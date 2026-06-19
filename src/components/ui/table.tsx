import * as React from "react";

import { cn } from "@/lib/utils";

/** טבלת נתונים — עקבית עם design-system (גבול 0.5px, כותרת muted, ריווח 12px). */
export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="border-border bg-bg-surface w-full overflow-x-auto rounded-lg border">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return (
    <thead className={cn("border-border border-b", className)} {...props} />
  );
}

export function TableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">) {
  return (
    <tbody
      className={cn(
        "[&_tr]:border-border [&_tr:not(:last-child)]:border-b",
        className,
      )}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn("hover:bg-bg-muted/50 transition-colors", className)}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "text-text-muted px-3 py-2.5 text-start text-xs font-medium",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      className={cn("text-text-body px-3 py-3 text-start", className)}
      {...props}
    />
  );
}
