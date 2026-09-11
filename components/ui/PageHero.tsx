import type { ReactNode } from "react";

import { cn } from "@/lib/design-system/cn";
import { sections } from "@/lib/design-system/tokens";

export type PageHeroSection = keyof typeof sections | "neutral";

type PageHeroProps = {
  section?: PageHeroSection;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

/**
 * Permanent HTV authenticated-app page header.
 *
 * Design rules:
 * - olive eyebrow
 * - dark sans-serif title
 * - restrained description
 * - actions aligned right
 * - no marketing-style hero card
 * - no page-specific theme colors
 *
 * `section` remains accepted for backwards compatibility.
 */
export default function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-6 pb-1 pt-1 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
            {eyebrow}
          </p>
        ) : null}

        <h1
          className={cn(
            "text-[36px] font-semibold leading-none tracking-[-0.045em] text-[#17212a] sm:text-[42px]",
            eyebrow && "mt-3",
          )}
        >
          {title}
        </h1>

        {description ? (
          <p className="mt-4 max-w-2xl text-[15px] leading-6 text-[#68737b]">
            {description}
          </p>
        ) : null}
      </div>

      {children ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {children}
        </div>
      ) : null}
    </section>
  );
}
