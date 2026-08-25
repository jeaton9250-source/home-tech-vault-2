import type { ReactNode } from "react";

import LandingFooter from "@/components/landing/public/LandingFooter";
import LandingHeader from "@/components/landing/public/LandingHeader";
import { landingTheme } from "@/components/landing/public/landingTheme";
import StructuredData from "@/components/marketing/StructuredData";
import { cn } from "@/lib/design-system/cn";
import type { PublicFoundingProgramSummary } from "@/lib/founding-members/types";
import { createOrganizationJsonLd } from "@/lib/marketing/metadata";

type MarketingLayoutProps = {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
  foundingSummary?: PublicFoundingProgramSummary | null;
  minimalNav?: boolean;
};

export default function MarketingLayout({
  children,
  className,
  mainClassName,
}: MarketingLayoutProps) {
  return (
    <div className={cn(landingTheme.page, className)}>
      <StructuredData
        data={createOrganizationJsonLd()}
      />

      <LandingHeader />

      <main
        id="main-content"
        className={cn(
          "min-h-[calc(100vh-72px)] bg-[#f5f1e8] text-[#17212a]",
          mainClassName
        )}
      >
        {children}
      </main>

      <LandingFooter />
    </div>
  );
}

export function MarketingContent({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        "mx-auto w-full max-w-[1240px] px-5 py-16 md:px-8 md:py-24",
        className
      )}
    >
      {children}
    </div>
  );
}

export function MarketingPageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-[#17212a]/10 bg-[#f5f1e8] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-3xl">
        {eyebrow ? (
          <div className="flex items-center gap-3">
            <span className="h-px w-7 bg-[#617c43]" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#617c43]">
              {eyebrow}
            </p>
          </div>
        ) : null}

        <h1
          className={cn(
            "font-serif text-4xl font-medium leading-[1.04] tracking-[-0.045em] text-[#17212a] md:text-5xl",
            eyebrow && "mt-5"
          )}
        >
          {title}
        </h1>

        {description ? (
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#68716c]">
            {description}
          </p>
        ) : null}

        {children}
      </div>
    </section>
  );
}
