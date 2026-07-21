import type { ReactNode } from "react";

import { cn } from "@/lib/design-system/cn";

import {
  colors,
  sections,
} from "@/lib/design-system/tokens";

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

function sectionTint(
  section: PageHeroSection
) {
  if (section === "neutral") {
    return {
      accent: colors.charcoalSoft,
      soft: colors.surfaceSunken,
    };
  }

  return sections[section];
}

export default function PageHero({
  section = "neutral",
  eyebrow,
  title,
  description,
  children,
  className,
}: PageHeroProps) {
  const tint = sectionTint(section);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-8 shadow-[var(--shadow-sm)] md:p-10",
        className
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p
              className="text-overline"
              style={{ color: tint.accent }}
            >
              {eyebrow}
            </p>
          ) : null}

          <h1
            className={cn(
              "text-page-title text-text-primary",
              eyebrow && "mt-3"
            )}
          >
            {title}
          </h1>

          {description && (
            <p className="mt-4 max-w-2xl text-base leading-7 text-text-muted">
              {description}
            </p>
          )}
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
