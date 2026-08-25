import type { ReactNode } from "react";

import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingNav from "@/components/marketing/MarketingNav";
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
  foundingSummary = null,
  minimalNav = false,
}: MarketingLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-[#0b1623] text-[#f4f0e8] antialiased selection:bg-[#718d4f]/40",
        className
      )}
    >
      <StructuredData
        data={createOrganizationJsonLd()}
      />

      <MarketingNav
        foundingSummary={foundingSummary}
        minimal={minimalNav}
      />

      <main className={mainClassName}>
        {children}
      </main>

      <MarketingFooter />
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
    <section className="border-b border-white/10 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-3xl">
        {eyebrow ? (
          <div className="flex items-center gap-3">
            <span className="h-px w-7 bg-[#718d4f]" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8ca667]">
              {eyebrow}
            </p>
          </div>
        ) : null}

        <h1
          className={cn(
            "font-serif text-4xl font-medium leading-[1.04] tracking-[-0.045em] text-[#f4f0e8] md:text-5xl",
            eyebrow && "mt-5"
          )}
        >
          {title}
        </h1>

        {description ? (
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#aeb8c1]">
            {description}
          </p>
        ) : null}

        {children}
      </div>
    </section>
  );
}