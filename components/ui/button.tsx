import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * House button — squared, tracked uppercase, hairline borders.
 * Deliberately not the shadcn default look.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[2px] text-[11.5px] font-semibold uppercase tracking-[0.14em] transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "bg-brass-500 text-forge-950 hover:bg-brass-400 active:bg-brass-600",
        outline:
          "border border-bone-100/25 text-bone-100 hover:border-brass-400 hover:text-brass-300 bg-transparent",
        ghost: "text-stone-400 hover:text-bone-100",
        light:
          "bg-forge-950 text-bone-100 hover:bg-forge-800 border border-forge-950",
      },
      size: {
        sm: "h-8 px-3.5",
        md: "h-10 px-5",
        lg: "h-12 px-7",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export function buttonClass(opts?: VariantProps<typeof buttonVariants> & { className?: string }) {
  return cn(buttonVariants({ variant: opts?.variant, size: opts?.size }), opts?.className);
}
