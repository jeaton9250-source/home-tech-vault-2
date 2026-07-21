import { ReactNode } from "react";

import StatusChip from "@/components/ui/StatusChip";

type StatusBadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "accent"
  | "premium"
  | "achievement";

type StatusBadgeProps = {
  children: ReactNode;
  variant?: StatusBadgeVariant;
};

const variantMap: Record<
  StatusBadgeVariant,
  "neutral" | "success" | "warning" | "danger" | "accent" | "premium"
> = {
  neutral: "neutral",
  success: "success",
  warning: "warning",
  danger: "danger",
  accent: "accent",
  premium: "premium",
  achievement: "warning",
};

/** @deprecated Prefer StatusChip */
export default function StatusBadge({
  children,
  variant = "neutral",
}: StatusBadgeProps) {
  return (
    <StatusChip
      variant={variantMap[variant]}
    >
      {children}
    </StatusChip>
  );
}
