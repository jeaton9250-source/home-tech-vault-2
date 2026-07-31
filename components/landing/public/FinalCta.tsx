"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import SignInLink from "@/components/auth/SignInLink";
import LandingTrackedLink from "@/components/landing/public/LandingTrackedLink";
import { landingTheme } from "@/components/landing/public/landingTheme";
import { LANDING_ANALYTICS_EVENTS } from "@/lib/marketing/landingAnalytics";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

type FinalCtaProps = {
  isSignedIn?: boolean;
};

export default function FinalCta({
  isSignedIn = false,
}: FinalCtaProps) {
  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.demo;
  const primaryLabel = isSignedIn
    ? "Open Home Tech Vault"
    : "Try the Interactive Demo";

  return (
    <section className="px-5 py-20 md:px-8 md:py-28 lg:px-12 bg-surface-base">
      <div className={landingTheme.sectionNarrow}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            landingTheme.card,
            "relative overflow-hidden border border-border-subtle bg-gradient-to-b from-surface-card via-surface-card to-surface-sunken/40 px-8 py-16 text-center md:px-16 md:py-20 shadow-lift rounded-[36px]"
          )}
        >
          {/* Subtle top ambient glow */}
          <div className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-60 w-96 -translate-x-1/2 rounded-full bg-home-health-soft/50 blur-3xl" />

          <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle/80 bg-surface-card px-4 py-2 text-xs font-semibold text-text-primary shadow-sm mb-6">
            <Sparkles size={14} className="text-home-health" />
            <span>The Operating System for Your Home</span>
          </div>

          <h2 className="mx-auto max-w-3xl text-3xl font-medium tracking-[-0.04em] text-text-primary md:text-5xl md:leading-[1.08]">
            Your home is already connected. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-text-primary via-home-health to-premium bg-clip-text text-transparent">
              Now make it understood.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-text-muted md:text-lg">
            Experience absolute awareness, proactive warranty protection, and intelligent guidance—all unified in one serene control center.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
            <LandingTrackedLink
              href={primaryHref}
              eventName={LANDING_ANALYTICS_EVENTS.finalCta}
              className={landingTheme.btnPrimary}
            >
              {primaryLabel}
              <ArrowRight
                size={16}
                className="ml-2.5"
                aria-hidden
              />
            </LandingTrackedLink>

            <LandingTrackedLink
              href={MARKETING_ROUTES.demo}
              eventName={
                LANDING_ANALYTICS_EVENTS.finalCtaExploreDemo
              }
              className={landingTheme.btnSecondary}
            >
              Watch the Product Tour
            </LandingTrackedLink>

            {!isSignedIn ? (
              <SignInLink className={landingTheme.link}>
                Sign In
              </SignInLink>
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
