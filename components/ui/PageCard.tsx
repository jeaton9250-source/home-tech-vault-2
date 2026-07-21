import { ReactNode } from "react";

import { cn } from "@/lib/design-system/cn";

type PageCardProps = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  elevated?: boolean;
  inset?: boolean;
};

export default function PageCard({
  children,
  className = "",
  interactive = false,
  elevated = true,
  inset = false,
}: PageCardProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-card)] border border-border-subtle p-6 md:p-8",
        elevated &&
          "bg-gradient-to-b from-surface-card to-surface-base/40 shadow-[var(--shadow-sm),var(--shadow-md),var(--shadow-inset)]",
        inset &&
          "bg-surface-sunken shadow-[var(--shadow-well),var(--shadow-inset)]",
        !elevated &&
          !inset &&
          "bg-surface-card shadow-[var(--shadow-sm)]",
        interactive &&
          "htv-card-interactive",
        className
      )}
    >
      {children}
    </section>
  );
}
