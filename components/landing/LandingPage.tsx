"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Laptop,
  Loader2,
  Play,
} from "lucide-react";

import LandingBenefitsSection from "@/components/landing/LandingBenefitsSection";
import LandingProductPreview from "@/components/landing/LandingProductPreview";
import LandingTrustSection from "@/components/landing/LandingTrustSection";
import {
  CommandCenterPreview,
  PillarPreview,
} from "@/components/landing/LandingPreviews";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { useDemoMode } from "@/hooks/useDemoMode";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { sections } from "@/lib/design-system/tokens";
import type { PublicFoundingProgramSummary } from "@/lib/founding-members/types";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: {
    duration: 0.5,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};

type LandingPageProps = {
  foundingSummary?: PublicFoundingProgramSummary | null;
};

export default function LandingPage({
  foundingSummary = null,
}: LandingPageProps) {
  const {
    user,
    loading,
  } = useDemoMode();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base">
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2
            size={22}
            className="animate-spin"
            aria-hidden
          />
          Loading...
        </div>
      </div>
    );
  }

  const isSignedIn = Boolean(user);
  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;
  const primaryLabel = isSignedIn
    ? "Go to Your Vault"
    : "Create Your Free Vault";

  return (
    <MarketingLayout
      mainClassName="overflow-x-hidden"
      foundingSummary={foundingSummary}
    >
      {/* 1. Hero */}
      <section className="relative px-6 pb-12 pt-14 md:px-8 md:pb-16 md:pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-home-health-soft/35 to-transparent" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <h1 className="max-w-xl text-4xl font-medium tracking-[-0.04em] md:text-5xl md:leading-[1.05]">
              Your home technology,
              organized in one place.
            </h1>

            <p className="mt-4 max-w-lg text-base leading-7 text-text-muted md:text-lg">
              Track devices, warranties, documents, and
              subscriptions without digging through drawers
              or inboxes.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={primaryHref}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-charcoal px-6 py-3 text-sm font-medium text-surface-card transition hover:bg-charcoal-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-charcoal/20"
              >
                {primaryLabel}
                <ArrowRight size={16} aria-hidden />
              </Link>

              {!isSignedIn ? (
                <Link
                  href={MARKETING_ROUTES.demo}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-6 py-3 text-sm font-medium text-text-primary transition hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-interaction/15"
                >
                  <Play size={16} aria-hidden />
                  Watch Demo
                </Link>
              ) : null}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto w-full max-w-xl lg:max-w-none"
          >
            <PillarPreview
              icon={Laptop}
              accent={sections.technology.accent}
              soft={sections.technology.soft}
            >
              <CommandCenterPreview />
            </PillarPreview>
          </motion.div>
        </div>
      </section>

      {/* 2. Benefits */}
      <LandingBenefitsSection />

      {/* 3. Product preview */}
      <LandingProductPreview />

      {/* 4. Trust */}
      <LandingTrustSection />

      {/* 5. Final CTA */}
      <section className="px-6 pb-16 md:px-8 md:pb-20">
        <motion.div
          {...fadeUp}
          className="mx-auto max-w-3xl overflow-hidden rounded-[var(--radius-card)] bg-charcoal px-8 py-12 text-center text-surface-card md:px-12 md:py-14"
        >
          <h2 className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">
            {isSignedIn
              ? "Your vault is ready."
              : "Create your free vault today."}
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/70">
            {isSignedIn
              ? "Pick up where you left off."
              : "Start free in minutes. No credit card required."}
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-surface-card px-6 py-3 text-sm font-medium text-charcoal transition hover:brightness-95 sm:w-auto"
            >
              {primaryLabel}
              <ArrowRight size={16} aria-hidden />
            </Link>

            {!isSignedIn ? (
              <Link
                href={MARKETING_ROUTES.demo}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10 sm:w-auto"
              >
                <Play size={16} aria-hidden />
                Watch Demo
              </Link>
            ) : null}
          </div>
        </motion.div>
      </section>
    </MarketingLayout>
  );
}
