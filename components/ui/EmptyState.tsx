import type { ReactNode } from "react";
import Link from "next/link";

import type { LucideIcon } from "lucide-react";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/design-system/cn";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  helpLabel?: string;
  helpHref?: string;
  className?: string;
  children?: ReactNode;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  helpLabel,
  helpHref,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-border-subtle bg-surface-card px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-card)] border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
        <Icon size={28} strokeWidth={1.75} />
      </div>

      <h3 className="text-card-title mt-5 text-text-primary">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
        {description}
      </p>

      {children}

      {actionLabel &&
        (actionHref ? (
          <Button
            href={actionHref}
            className="mt-6"
          >
            {actionLabel}
          </Button>
        ) : onAction ? (
          <Button
            type="button"
            onClick={onAction}
            className="mt-6"
          >
            {actionLabel}
          </Button>
        ) : null)}

      {helpLabel && helpHref && (
        <Link
          href={helpHref}
          className="mt-4 text-sm font-medium text-interaction hover:text-interaction-hover"
        >
          {helpLabel}
        </Link>
      )}
    </div>
  );
}
