import type { ReactNode } from "react";

import { cn } from "@/lib/design-system/cn";

import { sections } from "@/lib/design-system/tokens";

export type PageHeroSection =
  | keyof typeof sections
  | "neutral";

type PageHeroProps = {
  section?: PageHeroSection;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export default function PageHero({
  section: _section = "neutral",
  eyebrow,
  title,
  description,
  children,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-[#182533]/10 bg-[#f8f5ef] p-7 shadow-[0_24px_65px_-45px_rgba(15,25,35,0.4)] md:p-10",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#718d4f]/7 blur-3xl" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <div className="flex items-center gap-3">
              <span className="h-px w-7 bg-[#617c43]" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#617c43]">
                {eyebrow}
              </p>
            </div>
          ) : null}

          <h1
            className={cn(
              "font-serif text-3xl font-medium leading-[1.05] tracking-[-0.04em] text-[#101a22] md:text-4xl lg:text-[2.75rem]",
              eyebrow && "mt-4"
            )}
          >
            {title}
          </h1>

          {description ? (
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#67727a]">
              {description}
            </p>
          ) : null}
        </div>

        {children ? (
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}