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
        "min-h-screen bg-surface-base text-text-primary",
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
      <main className={mainClassName}>{children}</main>
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
        "mx-auto w-full max-w-6xl px-6 py-16 md:px-8 md:py-24",
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
    <section className="border-b border-border-subtle/80 px-6 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-3xl">
        {eyebrow && (
          <p className="text-overline text-text-muted">
            {eyebrow}
          </p>
        )}

        <h1
          className={cn(
            "text-4xl font-medium tracking-[-0.04em] md:text-5xl md:leading-[1.08]",
            eyebrow && "mt-4"
          )}
        >
          {title}
        </h1>

        {description && (
          <p className="mt-6 max-w-2xl text-lg leading-8 text-text-muted">
            {description}
          </p>
        )}

        {children}
      </div>
    </section>
  );
}
