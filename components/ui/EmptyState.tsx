import type { ReactNode } from "react";
import Link from "next/link";

import type { LucideIcon } from "lucide-react";

import Button from "@/components/ui/Button";
import type { IconWellSection } from "@/components/ui/IconWell";
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
  section?: IconWellSection;
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
  section: _section = "technology",
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center overflow-hidden rounded-[28px] border border-[#182533]/10 bg-[#f8f5ef] px-6 py-14 text-center shadow-[0_20px_50px_-40px_rgba(15,25,35,0.5)]",
        className
      )}
      role="status"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#718d4f]/7 blur-3xl" />

      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[#617c43]/20 bg-[#617c43]/10 text-[#617c43]">
        <Icon
          size={25}
          strokeWidth={1.8}
          aria-hidden
        />
      </div>

      <p className="relative mt-5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
        Home Tech Vault
      </p>

      <h3 className="relative mt-2 font-serif text-2xl font-medium tracking-[-0.03em] text-[#17212a]">
        {title}
      </h3>

      <p className="relative mt-3 max-w-md text-sm leading-6 text-[#68737b]">
        {description}
      </p>

      {children}

      {actionLabel &&
        (actionHref ? (
          <Button
            href={actionHref}
            className="relative mt-6"
          >
            {actionLabel}
          </Button>
        ) : onAction ? (
          <Button
            type="button"
            onClick={onAction}
            className="relative mt-6"
          >
            {actionLabel}
          </Button>
        ) : null)}

      {helpLabel && helpHref ? (
        <Link
          href={helpHref}
          className="relative mt-4 text-sm font-medium text-[#617c43] transition hover:text-[#718d4f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#617c43]"
        >
          {helpLabel}
        </Link>
      ) : null}
    </div>
  );
}