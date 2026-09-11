import type { ReactNode } from "react";

import MarketingHeaderGate from "@/components/marketing/MarketingHeaderGate";
import MarketingFooterGate from "@/components/marketing/MarketingFooterGate";

import { cn } from "@/lib/design-system/cn";

import type { PublicFoundingProgramSummary } from "@/lib/founding-members/types";

type MarketingLayoutProps = {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
  foundingSummary?: PublicFoundingProgramSummary | null;
  minimalNav?: boolean;
};

/*
 * Public marketing shell.
 *
 * MarketingHeaderGate / MarketingFooterGate keep the public
 * navigation off authenticated HTV application routes while
 * preserving it everywhere else.
 *
 * foundingSummary and minimalNav remain in the public API
 * because older marketing pages still pass those properties.
 */
export default function MarketingLayout({
  children,
  className,
  mainClassName,
}: MarketingLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-[#fffefa] text-[#17212a] antialiased selection:bg-[#617c43]/20",
        className
      )}
    >
      <MarketingHeaderGate />

      <main className={mainClassName}>
        {children}
      </main>

      <MarketingFooterGate />
    </div>
  );
}

/*
 * Shared wrapper used throughout public marketing,
 * knowledge, FAQ, comparison, trust and SEO pages.
 *
 * This named export existed before the app-shell work
 * and must remain backwards compatible.
 */
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

/*
 * Shared public page hero.
 *
 * Updated to the permanent HTV cream + olive design
 * instead of restoring the old dark-blue marketing theme.
 */
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
    <section className="border-b border-[#e4e2dc] bg-[#fffefa] px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-3xl">
        {eyebrow ? (
          <div className="flex items-center gap-3">
            <span className="h-px w-7 bg-[#718d4f]" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#718d4f]">
              {eyebrow}
            </p>
          </div>
        ) : null}

        <h1
          className={cn(
            "text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-[#17212a] md:text-5xl",
            eyebrow && "mt-5"
          )}
        >
          {title}
        </h1>

        {description ? (
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#68737b]">
            {description}
          </p>
        ) : null}

        {children}
      </div>
    </section>
  );
}
