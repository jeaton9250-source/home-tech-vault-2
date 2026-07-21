"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

import { CommandCenterPreview } from "@/components/landing/LandingPreviews";
import { MarketingContent } from "@/components/marketing/MarketingLayout";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { WALKTHROUGH_VIDEO } from "@/lib/marketing/trust";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: {
    duration: 0.5,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};

export default function VideoWalkthroughSection() {
  const hasEmbed =
    WALKTHROUGH_VIDEO.embedUrl.length > 0;

  return (
    <section className="border-y border-border-subtle bg-surface-card/30">
      <MarketingContent>
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <motion.div {...fadeUp}>
            <p className="text-overline text-text-muted">
              Walkthrough
            </p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.03em] md:text-4xl">
              {WALKTHROUGH_VIDEO.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-text-muted">
              {WALKTHROUGH_VIDEO.description}
            </p>

            {!hasEmbed ? (
              <Link
                href={MARKETING_ROUTES.demo}
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-button)] bg-charcoal px-5 py-2.5 text-sm font-medium text-surface-card transition hover:bg-charcoal-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
              >
                <Play size={16} aria-hidden />
                Open interactive demo
              </Link>
            ) : null}
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{
              ...fadeUp.transition,
              delay: 0.06,
            }}
            className="overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface-card shadow-[var(--shadow-md)]"
          >
            {hasEmbed ? (
              <div className="relative aspect-video w-full">
                <iframe
                  src={WALKTHROUGH_VIDEO.embedUrl}
                  title={WALKTHROUGH_VIDEO.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <Link
                href={MARKETING_ROUTES.demo}
                className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
                aria-label="Open the interactive demo walkthrough"
              >
                <div className="relative">
                  <div className="pointer-events-none opacity-95 transition group-hover:opacity-100">
                    <CommandCenterPreview />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center bg-charcoal/10 transition group-hover:bg-charcoal/15">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white/90 text-charcoal shadow-[var(--shadow-md)]">
                      <Play
                        size={22}
                        aria-hidden
                      />
                    </span>
                  </div>
                </div>
              </Link>
            )}
          </motion.div>
        </div>
      </MarketingContent>
    </section>
  );
}
