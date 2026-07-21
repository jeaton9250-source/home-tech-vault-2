import type { ReactNode } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";

import { cn } from "@/lib/design-system/cn";

export type AlertVariant =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "danger";

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
};

const variantStyles: Record<
  Exclude<AlertVariant, "danger">,
  { container: string; icon: typeof Info }
> = {
  info: {
    container:
      "border-interaction/25 bg-interaction-soft text-text-secondary",
    icon: Info,
  },
  success: {
    container:
      "border-success/25 bg-success-soft text-success",
    icon: CheckCircle2,
  },
  warning: {
    container:
      "border-warning/25 bg-warning-soft text-warning",
    icon: AlertTriangle,
  },
  error: {
    container:
      "border-danger/25 bg-danger-soft text-danger",
    icon: AlertCircle,
  },
};

function resolveVariant(
  variant: AlertVariant
): Exclude<AlertVariant, "danger"> {
  return variant === "danger"
    ? "error"
    : variant;
}

export default function Alert({
  variant = "info",
  title,
  children,
  className,
}: AlertProps) {
  const resolvedVariant =
    resolveVariant(variant);
  const styles =
    variantStyles[resolvedVariant];
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
