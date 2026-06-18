import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge לפי design-system.md: radius-sm, padding 5px 12px, 12px/500.
 * הווריאנטים מותאמים למיפוי סטטוס התשלום → צבע סמנטי.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-3 py-[5px] text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary-50 text-primary-700",
        success: "bg-success-bg text-success-text",
        warning: "bg-warning-bg text-warning-text",
        danger: "bg-danger-bg text-danger-text",
        info: "bg-info-bg text-info-text",
        muted: "bg-bg-muted text-text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { badgeVariants };
