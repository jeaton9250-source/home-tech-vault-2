"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Laptop,
  Loader2,
  Sparkles,
} from "lucide-react";

import MarketingLayout, {
  MarketingContent,
} from "@/components/marketing/MarketingLayout";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";
import { TrustBadgeGrid } from "@/components/marketing/TrustIndicators";
import {
  CommandCenterPreview,
  PillarPreview,
} from "@/components/landing/LandingPreviews";
import { useDemoMode } from "@/hooks/useDemoMode";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { sections } from "@/lib/design-system/tokens";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: {
    duration: 0.55,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};

const outcomes = [
  {
    title: "Never lose a warranty again",
    copy: "See what's protected before a repair becomes expensive.",
  },
  {
    title: "Find any receipt instantly",
    copy: "Documents stay attached to the devices they protect.",
  },
  {
    title: "Share one trusted home record",
    copy: "Invite family with roles — without sharing every password.",
  },
] as const;

export default function LandingPage() {
  const router = useRouter();
  const {
    user,
    loading,
    startDemo,
  } = useDemoMode();

  function handleExploreDemo() {
    startDemo();
    router.push("/dashboard");
  }

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

  return (
    <MarketingLayout mainClassName="overflow-x-hidden">
      <section className="relative px-6 pb-24 pt-16 md:px-8 md:pb-32 md:pt-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-home-health-soft/40 to-transparent" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <motion.div {...fadeUp}>
            <p className="text-overline text-text-muted">
              Home technology, finally organized
            </p>

            <h1 className="mt-5 text-4xl font-medium tracking-[-0.04em] md:text-6xl md:leading-[1.02]">
              One vault for every device in your home.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-text-muted">
              Track warranties, store receipts, and protect
              your entire home technology inventory — calmly,
              clearly, in one place.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={
                  isSignedIn
                    ? "/dashboard"
                    : MARKETING_ROUTES.signup
                }
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-charcoal px-7 py-3 text-sm font-medium text-surface-card transition hover:bg-charcoal-hover"
              >
                {isSignedIn
                  ? "Go to Your Vault"
                  : "Start Free"}
                <ArrowRight size={16} aria-hidden />
              </Link>

              {!isSignedIn && (
                <>
                  <Link
                    href={MARKETING_ROUTES.demo}
                    className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle px-7 py-3 text-sm font-medium transition hover:bg-surface-hover"
                  >
                    View Demo
                  </Link>

                  <button
                    type="button"
                    onClick={handleExploreDemo}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-warning/30 bg-warning-soft px-7 py-3 text-sm font-medium text-achievement transition hover:brightness-[0.98]"
                  >
                    <Sparkles size={16} aria-hidden />
                    Interactive Demo
                  </button>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{
              ...fadeUp.transition,
              delay: 0.08,
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

      <section className="border-y border-border-subtle bg-surface-card/40 px-6 py-14 md:px-8">
        <MarketingContent className="py-0">
          <TrustBadgeGrid />
        </MarketingContent>
      </section>

      <MarketingContent>
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="text-overline text-text-muted">
            Outcomes
          </p>
          <h2 className="mt-4 text-3xl font-medium tracking-[-0.03em] md:text-4xl">
            Less chaos. More confidence.
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {outcomes.map((item, index) => (
            <motion.article
              key={item.title}
              {...fadeUp}
              transition={{
                ...fadeUp.transition,
                delay: index * 0.06,
              }}
              className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-8"
            >
              <h3 className="text-lg font-medium tracking-[-0.02em]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-text-muted">
                {item.copy}
              </p>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={MARKETING_ROUTES.features}
            className="inline-flex items-center gap-2 text-sm font-medium text-interaction hover:text-interaction-hover"
          >
            Explore all four pillars
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </MarketingContent>

      <TestimonialsSection />

      <section className="px-6 pb-24 md:px-8 md:pb-32">
        <motion.div
          {...fadeUp}
          className="mx-auto max-w-4xl overflow-hidden rounded-[var(--radius-card)] bg-charcoal px-8 py-16 text-center text-surface-card md:px-14 md:py-20"
        >
          <p className="text-overline text-home-health">
            Ready when you are
          </p>

          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-medium tracking-[-0.03em] md:text-4xl">
            {isSignedIn
              ? "Your vault is waiting."
              : "Start organizing your home technology today."}
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/70 md:text-base">
            {isSignedIn
              ? "Pick up where you left off with devices, warranties, and documents in one place."
              : "Create a free account in minutes, or explore the interactive demo with no signup."}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={
                isSignedIn
                  ? "/dashboard"
                  : MARKETING_ROUTES.signup
              }
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-surface-card px-7 py-3 text-sm font-medium text-charcoal transition hover:brightness-95 sm:w-auto"
            >
              {isSignedIn
                ? "Go to Your Vault"
                : "Start Free"}
              <ArrowRight size={16} aria-hidden />
            </Link>

            {!isSignedIn && (
              <Link
                href={MARKETING_ROUTES.pricing}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-button)] border border-white/15 px-7 py-3 text-sm font-medium text-white transition hover:bg-white/10 sm:w-auto"
              >
                View Pricing
              </Link>
            )}
          </div>
        </motion.div>
      </section>
    </MarketingLayout>
  );
}
