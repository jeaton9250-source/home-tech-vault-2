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
        "rounded-[28px] border border-[#dedbd0] bg-[#fffdf8] p-6 md:p-8",
        elevated &&
          "shadow-[0_12px_42px_rgba(24,48,71,0.055)]",
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
