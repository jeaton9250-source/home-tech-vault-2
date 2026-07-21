import type { ReactNode } from "react";

import { cn } from "@/lib/design-system/cn";

type BadgeVariant =
  | "neutral"
  | "accent"
  | "premium"
  | "success"
  | "warning"
  | "danger"
  | "achievement";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variants: Record<
  BadgeVariant,
  string
> = {
  neutral:
    "bg-surface-sunken text-text-secondary",
  accent:
    "bg-charcoal/8 text-charcoal-soft",
  premium:
    "bg-premium-soft text-premium",
  success:
    "bg-success-soft text-success",
  warning:
    "bg-warning-soft text-warning",
  danger:
    "bg-danger-soft text-danger",
  achievement:
    "bg-achievement-soft text-achievement",
};

export default function Badge({
  children,
  variant = "neutral",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-chip)] px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
