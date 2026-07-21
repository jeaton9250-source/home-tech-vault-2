import type { ReactNode } from "react";

import StatusChip from "@/components/ui/StatusChip";

export type StatusBadgeVariant =
  | "active"
  | "online"
  | "offline"
  | "warning"
  | "expired"
  | "neutral"
  | "success"
  | "danger"
  | "accent"
  | "premium"
  | "achievement";

type StatusBadgeProps = {
  children: ReactNode;
  variant?: StatusBadgeVariant;
  className?: string;
  dot?: boolean;
};

const variantMap: Record<
  StatusBadgeVariant,
  {
    chip:
      | "neutral"
      | "success"
      | "warning"
      | "danger"
      | "accent"
      | "premium";
    dot?: boolean;
  }
> = {
  active: { chip: "success" },
  online: { chip: "success" },
  offline: { chip: "neutral" },
  warning: { chip: "warning" },
  expired: { chip: "danger" },
  neutral: { chip: "neutral", dot: false },
  success: { chip: "success" },
  danger: { chip: "danger" },
  accent: { chip: "accent" },
  premium: { chip: "premium" },
  achievement: { chip: "warning" },
};

export default function StatusBadge({
  children,
  variant = "neutral",
  className,
  dot,
}: StatusBadgeProps) {
  const mapped = variantMap[variant];
  const showDot =
    dot ?? mapped.dot ?? true;

  return (
    <StatusChip
      variant={mapped.chip}
      dot={showDot}
      className={className}
    >
      {children}
    </StatusChip>
  );
}
