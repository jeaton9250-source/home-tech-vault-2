"use client";

import { motion } from "framer-motion";

import { MarketingContent } from "@/components/marketing/MarketingLayout";
import { HOW_IT_WORKS_STEPS } from "@/lib/marketing/trust";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: {
    duration: 0.5,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};

export default function HowItWorksSection() {
  return (
    <section className="border-y border-border-subtle bg-surface-card/30">
      <MarketingContent>
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="text-overline text-text-muted">
            How it works
          </p>
          <h2 className="mt-4 text-3xl font-medium tracking-[-0.03em] md:text-4xl">
            From signup to shared household record
          </h2>
          <p className="mt-4 text-base leading-7 text-text-muted">
            Five calm steps to organize the technology
            your home depends on.
          </p>
        </motion.div>

        <ol className="relative mt-12 space-y-0">
          {HOW_IT_WORKS_STEPS.map(
            (step, index) => (
              <motion.li
                key={step.step}
                {...fadeUp}
                transition={{
                  ...fadeUp.transition,
                  delay: index * 0.05,
                }}
                className="relative grid gap-4 pb-10 pl-12 last:pb-0 md:grid-cols-[auto_1fr] md:gap-8 md:pl-0"
              >
                {index <
                HOW_IT_WORKS_STEPS.length - 1 ? (
                  <span
                    className="absolute left-[1.125rem] top-10 hidden h-[calc(100%-2rem)] w-px bg-border-subtle md:left-[1.75rem] md:block"
                    aria-hidden
                  />
                ) : null}

                <div className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-interaction/20 bg-interaction-soft text-sm font-medium tabular-nums text-interaction md:relative md:h-14 md:w-14 md:text-base">
                  {step.step}
                </div>

                <div className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-6 shadow-[var(--shadow-sm)] md:min-h-[7.5rem]">
                  <h3 className="text-lg font-medium tracking-[-0.02em] text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-text-muted">
                    {step.description}
                  </p>
                </div>
              </motion.li>
            )
          )}
        </ol>
      </MarketingContent>
    </section>
  );
}
