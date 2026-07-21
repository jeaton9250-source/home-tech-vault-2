"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { MarketingContent } from "@/components/marketing/MarketingLayout";
import {
  SECURITY_PILLARS,
} from "@/lib/marketing/trust";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: {
    duration: 0.5,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};

export default function SecuritySection() {
  return (
    <section
      id="security"
      className="scroll-mt-24 border-y border-border-subtle bg-surface-card/30"
    >
      <MarketingContent>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <motion.div {...fadeUp} className="max-w-2xl">
            <p className="text-overline text-text-muted">
              Security
            </p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.03em] md:text-4xl">
              Security you can understand
            </h2>
            <p className="mt-4 text-base leading-7 text-text-muted">
              Authentication, privacy, household permissions,
              and secure cloud infrastructure — explained in
              plain language.
            </p>
          </motion.div>

          <Link
            href={MARKETING_ROUTES.trust}
            className="inline-flex items-center gap-2 text-sm font-medium text-interaction hover:text-interaction-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
          >
            Visit Trust Center
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {SECURITY_PILLARS.map(
            (pillar, index) => (
              <motion.article
                key={pillar.id}
                id={pillar.id}
                {...fadeUp}
                transition={{
                  ...fadeUp.transition,
                  delay: index * 0.04,
                }}
                className="scroll-mt-28 rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-7 shadow-[var(--shadow-sm)]"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-interaction-soft text-interaction">
                  <pillar.icon
                    size={18}
                    aria-hidden
                  />
                </span>
                <h3 className="mt-4 text-lg font-medium tracking-[-0.02em]">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-text-muted">
                  {pillar.description}
                </p>
              </motion.article>
            )
          )}
        </div>
      </MarketingContent>
    </section>
  );
}
