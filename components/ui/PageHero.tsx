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
        "relative flex flex-col gap-6 border-b border-[#ddd8cb] pb-8 pt-2 lg:flex-row lg:items-end lg:justify-between lg:pb-10",
        className,
      )}
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#617c43]">
            {eyebrow}
          </p>
        ) : null}

        <h1
          className={cn(
            "font-serif text-[clamp(2.8rem,5.2vw,5rem)] font-medium leading-[1.02] tracking-[-0.05em] text-[#183047]",
            eyebrow && "mt-4",
          )}
        >
          {title}
        </h1>

        {description ? (
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-[#59625d] sm:text-[16px]">
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
