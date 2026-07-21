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
        "rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-6 md:p-8",
        elevated &&
          "shadow-[var(--shadow-sm)]",
        inset &&
          "bg-surface-sunken shadow-[var(--shadow-well)]",
        !elevated &&
          !inset &&
          "shadow-none",
        interactive &&
          "htv-card-interactive cursor-pointer",
        className
      )}
    >
      {children}
    </section>
  );
}
