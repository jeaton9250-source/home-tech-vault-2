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
          "bg-surface-card shadow-[var(--shadow-sm),var(--shadow-inset)]",
        elevated &&
          !inset &&
          "bg-gradient-to-b from-surface-card to-surface-base/30",
        inset &&
          "bg-surface-sunken shadow-[var(--shadow-inset)]",
        !elevated &&
          !inset &&
          "bg-surface-card",
        interactive &&
          "htv-card-interactive",
        className
      )}
      style={
        elevated && !inset
          ? {
              boxShadow:
                "var(--shadow-sm), var(--shadow-md)",
            }
          : undefined
      }
    >
      {children}
    </section>
  );
}
