import type { ReactNode } from "react";

import MarketingHeader from "@/components/marketing/MarketingHeader";

type MarketingPageShellProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  visual?: ReactNode;
  children?: ReactNode;
  heroClassName?: string;
};

export default function MarketingPageShell({
  eyebrow,
  title,
  description,
  actions,
  visual,
  children,
  heroClassName = "",
}: MarketingPageShellProps) {
  return (
    <main className="min-h-screen bg-[#f7f5f1] text-[#152335]">
      <MarketingHeader />

      <section
        className={[
          "relative overflow-hidden border-b border-[#152335]/[0.06]",
          "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),rgba(238,244,246,0.78)_45%,rgba(247,245,241,1)_80%)]",
          heroClassName,
        ].join(" ")}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.35]">
          <div className="absolute -left-20 top-12 h-[360px] w-[360px] rounded-full bg-white blur-[100px]" />

          <div className="absolute right-[-100px] top-[100px] h-[430px] w-[430px] rounded-full bg-[#dfe9ec] blur-[120px]" />
        </div>

        <div className="relative mx-auto grid min-h-[620px] max-w-[1380px] items-center gap-14 px-5 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-24">
          <div className="max-w-[680px]">
            {eyebrow && (
              <div className="mb-6 inline-flex items-center rounded-full border border-[#152335]/10 bg-white/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#647384] backdrop-blur">
                {eyebrow}
              </div>
            )}

            <h1 className="font-serif text-[52px] leading-[0.98] tracking-[-0.05em] text-[#152335] sm:text-[68px] lg:text-[78px]">
              {title}
            </h1>

            {description && (
              <div className="mt-7 max-w-[625px] text-lg leading-8 text-[#647184] sm:text-xl">
                {description}
              </div>
            )}

            {actions && (
              <div className="mt-9 flex flex-wrap items-center gap-3">
                {actions}
              </div>
            )}
          </div>

          {visual && (
            <div className="relative">
              {visual}
            </div>
          )}
        </div>
      </section>

      {children}
    </main>
  );
}
