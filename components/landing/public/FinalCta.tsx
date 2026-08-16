"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type FinalCtaProps = {
  isSignedIn?: boolean;
};

export default function FinalCta({
  isSignedIn = false,
}: FinalCtaProps) {
  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;

  const primaryLabel = isSignedIn
    ? "Open My Vault"
    : "Create My Free Vault";

  return (
    <section className="relative overflow-hidden bg-surface-base px-5 py-20 md:px-8 md:py-28 lg:px-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-home-health-soft/40 via-premium-soft/20 to-interaction-soft/30 blur-3xl" />

      <div className={landingTheme.sectionNarrow}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-border-subtle bg-surface-card shadow-lift"
        >
          <div className="relative px-6 py-12 text-center sm:px-10 sm:py-16 lg:px-16">
            {/* Subtle internal glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-home-health-soft/30 blur-3xl" />

            {/* Eyebrow */}
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-home-health/20 bg-home-health-soft px-3.5 py-1.5 text-[11px] font-semibold text-home-health">
              <ShieldCheck
                size={14}
                aria-hidden
              />
              Start before you need it
            </div>

            {/* Headline */}
            <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-medium tracking-[-0.045em] text-text-primary sm:text-4xl md:text-5xl">
              Don&apos;t wait until
              <span className="block bg-gradient-to-r from-text-primary via-home-health to-premium bg-clip-text text-transparent">
                something breaks.
              </span>
            </h2>

            {/* Supporting copy */}
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
              Add one device today and give yourself one dependable place for
              the receipt, warranty, manual, serial number, and purchase
              information you may need later.
            </p>

            {/* Mini value points */}
            <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
              <ValuePoint text="Free to start" />
              <ValuePoint text="No credit card required" />
              <ValuePoint text="Start with just one device" />
              <ValuePoint text="Build your vault over time" />
            </div>

            {/* Primary action */}
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={primaryHref}
                className={`${landingTheme.btnPrimary} min-w-[220px] justify-center`}
              >
                {primaryLabel}

                <ArrowRight
                  size={16}
                  className="ml-2.5"
                  aria-hidden
                />
              </Link>

              {!isSignedIn && (
                <Link
                  href={MARKETING_ROUTES.demo}
                  className={`${landingTheme.btnSecondary} min-w-[180px] justify-center`}
                >
                  See the Demo
                </Link>
              )}
            </div>

            {!isSignedIn && (
              <p className="mt-4 text-xs font-medium text-text-muted">
                No subscription required to get started.
              </p>
            )}

            {/* Last line */}
            <div className="mx-auto mt-10 max-w-2xl border-t border-border-subtle/70 pt-7">
              <p className="text-sm font-semibold text-text-primary sm:text-base">
                The best time to save the information is before you need to
                search for it.
              </p>

              <p className="mt-2 text-xs leading-5 text-text-muted sm:text-sm">
                Your Home Tech Vault can start with one TV, appliance,
                computer, router, or device you care about today.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ValuePoint({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border-subtle bg-surface-sunken/40 px-4 py-3">
      <CheckCircle2
        size={16}
        className="shrink-0 text-home-health"
        aria-hidden
      />

      <span className="text-sm font-medium text-text-secondary">
        {text}
      </span>
    </div>
  );
}