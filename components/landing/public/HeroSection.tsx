"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Play, ShieldCheck, Sparkles, Wifi } from "lucide-react";

import HeroVisual from "@/components/landing/public/HeroVisual";
import LandingTrackedLink, {
  LandingScrollLink,
} from "@/components/landing/public/LandingTrackedLink";
import { landingTheme } from "@/components/landing/public/landingTheme";
import { LANDING_ANALYTICS_EVENTS } from "@/lib/marketing/landingAnalytics";
import {
  LANDING_HERO_REASSURANCE,
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type HeroSectionProps = {
  isSignedIn?: boolean;
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: custom * 0.1,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function HeroSection({
  isSignedIn = false,
}: HeroSectionProps) {
  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.demo;
  const primaryLabel = isSignedIn
    ? "Open Home OS"
    : "Try the Interactive Demo";

  return (
    <section className="relative overflow-hidden px-5 py-24 md:px-8 md:py-32 lg:px-12 bg-surface-base htv-mesh-hero-bg">
      {/* Subtle warm ambient backdrop glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-home-health-soft/40 via-surface-sunken/60 to-transparent blur-3xl" />

      <div className={landingTheme.sectionNarrow}>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Left Column — Hero Content & Action CTAs */}
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start"
          >
            {/* Pill Badge */}
            <motion.div variants={fadeUp} custom={0} className={landingTheme.pill}>
              <Sparkles size={14} className="text-home-health animate-pulse" />
              <span>Home Tech Vault · Operating System</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mt-6 max-w-2xl text-4xl font-medium tracking-[-0.04em] text-text-primary sm:text-5xl md:text-[3.5rem] lg:text-[3.85rem] lg:leading-[1.06]"
            >
              Your home&apos;s technology <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-text-primary via-home-health to-premium bg-clip-text text-transparent">
                finally has an operating system.
              </span>
            </motion.h1>

            {/* Subheadline Pillars */}
            <motion.div
              variants={fadeUp}
              custom={2}
              className="mt-7 space-y-2.5 text-xl font-medium tracking-tight text-text-secondary sm:text-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-interaction-soft text-interaction">
                  <Wifi size={14} strokeWidth={2.5} />
                </div>
                <span className="text-text-primary font-semibold">Everything connected.</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-home-health-soft text-home-health">
                  <ShieldCheck size={14} strokeWidth={2.5} />
                </div>
                <span className="text-text-primary font-semibold">Everything protected.</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-premium-soft text-premium">
                  <Sparkles size={14} strokeWidth={2.5} />
                </div>
                <span className="text-text-primary font-semibold">Everything understood.</span>
              </div>
            </motion.div>

            {/* Description Body */}
            <motion.p
              variants={fadeUp}
              custom={3}
              className="mt-6 max-w-xl text-base leading-7 text-text-muted md:text-lg md:leading-8"
            >
              Continuous network awareness, automated warranty protection, and an intelligent Home Advisor — unified in one calm control center for your home.
            </motion.p>

            {/* Primary & Secondary Action CTAs */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-9 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <LandingTrackedLink
                href={primaryHref}
                eventName={LANDING_ANALYTICS_EVENTS.heroExploreDemo}
                className={landingTheme.btnPrimary}
              >
                {primaryLabel}
                <ArrowRight size={16} className="ml-2.5" aria-hidden />
              </LandingTrackedLink>

              <LandingScrollLink
                sectionId={LANDING_PUBLIC_SECTION_IDS.advisor}
                eventName={LANDING_ANALYTICS_EVENTS.heroSeeHowItWorks}
                className={landingTheme.btnSecondary}
              >
                <Play size={15} className="mr-2 text-text-muted" aria-hidden />
                Watch a 60-second Tour
              </LandingScrollLink>
            </motion.div>

            {/* Reassurance items */}
            <motion.ul
              variants={fadeUp}
              custom={5}
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8"
            >
              {LANDING_HERO_REASSURANCE.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-xs font-medium uppercase tracking-wider text-text-muted sm:text-sm sm:normal-case sm:tracking-normal"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-home-health-soft text-home-health">
                    <Check size={13} strokeWidth={2.5} aria-hidden />
                  </div>
                  {item}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Right Column — Interactive Product Preview & Floating Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
