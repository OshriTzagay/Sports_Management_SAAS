import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * כפתורים לפי design-system.md:
 * ראשי = רקע primary-500 / טקסט לבן / hover primary-700.
 * משני = רקע לבן / גבול primary-500 / טקסט primary-500.
 * סכנה = רקע danger מלא / טקסט לבן.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,transform] outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-700",
        secondary:
          "border border-primary-500 bg-bg-surface text-primary-500 hover:bg-primary-50",
        outline:
          "border border-border bg-bg-surface text-text-primary hover:bg-bg-muted",
        destructive: "bg-danger text-white hover:bg-danger/90",
        ghost: "text-text-primary hover:bg-bg-muted",
        link: "text-primary-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "px-[18px] py-[9px]",
        sm: "px-3 py-1.5 text-[0.8rem]",
        lg: "px-6 py-2.5 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
