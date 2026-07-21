"use client";

import { motion } from "framer-motion";

import { MarketingContent } from "@/components/marketing/MarketingLayout";
import { WHY_TRUST_POINTS } from "@/lib/marketing/trust";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: {
    duration: 0.5,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};

export default function WhyTrustSection() {
  return (
    <MarketingContent>
      <motion.div {...fadeUp} className="max-w-2xl">
        <p className="text-overline text-text-muted">
          Trust
        </p>
        <h2 className="mt-4 text-3xl font-medium tracking-[-0.03em] md:text-4xl">
          Why people trust Home Tech Vault
        </h2>
        <p className="mt-4 text-base leading-7 text-text-muted md:text-lg">
          A premium home record should feel calm,
          transparent, and respectful of your privacy —
          not like another noisy dashboard.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {WHY_TRUST_POINTS.map(
          (point, index) => (
            <motion.article
              key={point.title}
              {...fadeUp}
              transition={{
                ...fadeUp.transition,
                delay: index * 0.05,
              }}
              className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-7 shadow-[var(--shadow-sm)]"
            >
              <h3 className="text-lg font-medium tracking-[-0.02em] text-text-primary">
                {point.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-text-muted">
                {point.description}
              </p>
            </motion.article>
          )
        )}
      </div>
    </MarketingContent>
  );
}
