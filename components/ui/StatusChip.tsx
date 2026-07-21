import type { ReactNode } from "react";

import { cn } from "@/lib/design-system/cn";

export { default as Badge } from "@/components/ui/Badge";

type StatusChipVariant =
  | "neutral"
  | "accent"
  | "premium"
  | "success"
  | "warning"
  | "danger";

type StatusChipProps = {
  children: ReactNode;
  variant?: StatusChipVariant;
  dot?: boolean;
  className?: string;
};

const variants: Record<
  StatusChipVariant,
  { chip: string; dot: string }
> = {
  neutral: {
    chip: "bg-surface-sunken text-text-secondary",
    dot: "bg-text-tertiary",
  },
  accent: {
    chip: "bg-interaction-soft text-interaction",
    dot: "bg-interaction",
  },
  premium: {
    chip: "bg-premium-soft text-premium",
    dot: "bg-premium",
  },
  success: {
    chip: "bg-home-health-soft text-home-health",
    dot: "bg-home-health",
  },
  warning: {
    chip: "bg-warning-soft text-warning",
    dot: "bg-warning",
  },
  danger: {
    chip: "bg-danger-soft text-danger",
    dot: "bg-danger",
  },
};

export default function StatusChip({
  children,
  variant = "neutral",
  dot = true,
  className,
}: StatusChipProps) {
  const styles = variants[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] px-2.5 py-1 text-xs font-medium",
        styles.chip,
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            styles.dot
          )}
        />
      )}

      {children}
    </span>
  );
}
