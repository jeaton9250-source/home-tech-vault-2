"use client";

import { motion } from "framer-motion";

import { MarketingContent } from "@/components/marketing/MarketingLayout";
import { FOUNDER_STORY } from "@/lib/marketing/trust";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: {
    duration: 0.5,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};

export default function FounderStorySection() {
  return (
    <MarketingContent>
      <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <motion.div
          {...fadeUp}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div
            className="aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-gradient-to-br from-interaction-soft via-surface-card to-home-health-soft shadow-[var(--shadow-md)]"
            role="img"
            aria-label={`${FOUNDER_STORY.name}, ${FOUNDER_STORY.role}`}
          >
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-3xl font-medium text-interaction shadow-[var(--shadow-sm)]">
                {FOUNDER_STORY.name.charAt(0)}
              </div>
              <p className="mt-6 text-sm font-medium text-text-primary">
                {FOUNDER_STORY.name}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {FOUNDER_STORY.role}
              </p>
              <p className="mt-5 text-xs uppercase tracking-[0.14em] text-text-tertiary">
                Founder photo placeholder
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div {...fadeUp}>
          <p className="text-overline text-text-muted">
            Founder story
          </p>
          <h2 className="mt-4 text-3xl font-medium tracking-[-0.03em] md:text-4xl">
            {FOUNDER_STORY.headline}
          </h2>
          <blockquote className="mt-6 border-l-2 border-interaction/30 pl-5 text-base leading-8 text-text-secondary md:text-lg">
            “{FOUNDER_STORY.quote}”
          </blockquote>
          <p className="mt-6 text-sm leading-7 text-text-muted">
            {FOUNDER_STORY.bio}
          </p>
          <p className="mt-5 text-sm font-medium text-text-primary">
            — {FOUNDER_STORY.name}
          </p>
        </motion.div>
      </div>
    </MarketingContent>
  );
}
