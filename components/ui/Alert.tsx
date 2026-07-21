import type { ReactNode } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";

import { cn } from "@/lib/design-system/cn";

type AlertVariant =
  | "info"
  | "success"
  | "warning"
  | "danger";

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
};

const variantStyles: Record<
  AlertVariant,
  { container: string; icon: typeof Info }
> = {
  info: {
    container:
      "border-interaction/25 bg-interaction-soft text-text-secondary",
    icon: Info,
  },
  success: {
    container:
      "border-home-health/25 bg-home-health-soft text-home-health",
    icon: CheckCircle2,
  },
  warning: {
    container:
      "border-warning/25 bg-warning-soft text-warning",
    icon: AlertTriangle,
  },
  danger: {
    container:
      "border-danger/25 bg-danger-soft text-danger",
    icon: AlertCircle,
  },
};

export default function Alert({
  variant = "info",
  title,
  children,
  className,
}: AlertProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-[var(--radius-button)] border px-4 py-3.5 text-sm leading-6",
        styles.container,
        className
      )}
    >
      <Icon
        size={18}
        className="mt-0.5 shrink-0"
        aria-hidden
      />

      <div className="min-w-0">
        {title ? (
          <p className="font-medium text-text-primary">
            {title}
          </p>
        ) : null}

        <div
          className={cn(
            title && "mt-1",
            !title && "text-inherit"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
