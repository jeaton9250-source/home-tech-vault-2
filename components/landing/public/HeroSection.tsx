"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  FileCheck2,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Wifi,
} from "lucide-react";

import HeroVisual from "@/components/landing/public/HeroVisual";
import LandingTrackedLink from "@/components/landing/public/LandingTrackedLink";
import { landingTheme } from "@/components/landing/public/landingTheme";
import { LANDING_ANALYTICS_EVENTS } from "@/lib/marketing/landingAnalytics";
import { LANDING_HERO_REASSURANCE } from "@/lib/marketing/landingPublicContent";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

const heroJobs = [
  {
    icon: Wifi,
    text: "Automatically discover devices connected to your home",
    tone: "bg-interaction-soft text-interaction",
  },
  {
    icon: FileCheck2,
    text: "Keep receipts, manuals, documents, and warranties together",
    tone: "bg-home-health-soft text-home-health",
  },
  {
    icon: Search,
    text: "Find the information you need in seconds",
    tone: "bg-premium-soft text-premium",
  },
] as const;

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
  const primaryHref = isSignedIn ? "/dashboard" : MARKETING_ROUTES.signup;
  const primaryLabel = isSignedIn ? "Open My Vault" : "Start Free";

  return (
    <section className="relative overflow-hidden bg-surface-base px-5 py-24 md:px-8 md:py-32 lg:px-12 htv-mesh-hero-bg">
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-home-health-soft/40 via-surface-sunken/60 to-transparent blur-3xl" />

      <div className={landingTheme.sectionNarrow}>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start"
          >
            <motion.div variants={fadeUp} custom={0} className={landingTheme.pill}>
              <Sparkles size={14} className="text-home-health" />
              <span>Home inventory + warranty tracker</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mt-6 max-w-3xl text-4xl font-medium tracking-[-0.04em] text-text-primary sm:text-5xl md:text-[3.5rem] lg:text-[3.85rem] lg:leading-[1.06]"
            >
              Your home inventory and warranty tracker,
              <span className="block bg-gradient-to-r from-text-primary via-home-health to-premium bg-clip-text text-transparent">
                that finds what&apos;s connected for you.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-7 max-w-2xl text-lg leading-8 text-text-secondary sm:text-xl"
            >
              Home Tech Vault auto-discovers your devices, then keeps their
              receipts, manuals, documents, and warranties in one place — so
              you never lose a warranty again.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-7 space-y-3"
            >
              {heroJobs.map(({ icon: Icon, text, tone }) => (
                <div key={text} className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tone}`}
                  >
                    <Icon size={15} strokeWidth={2.4} aria-hidden />
                  </div>
                  <span className="font-semibold text-text-primary">{text}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-9 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <LandingTrackedLink
                href={primaryHref}
                className={landingTheme.btnPrimary}
              >
                {primaryLabel}
                <ArrowRight size={16} className="ml-2.5" aria-hidden />
              </LandingTrackedLink>

              <LandingTrackedLink
                href={MARKETING_ROUTES.demo}
                eventName={LANDING_ANALYTICS_EVENTS.heroExploreDemo}
                className={landingTheme.btnSecondary}
              >
                <Play size={15} className="mr-2 text-text-muted" aria-hidden />
                Explore the Demo
              </LandingTrackedLink>
            </motion.div>

            <motion.ul
              variants={fadeUp}
              custom={5}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8"
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

            <motion.div
              variants={fadeUp}
              custom={6}
              className="mt-7 rounded-2xl border border-border-subtle bg-surface-card/85 p-4 text-sm leading-6 text-text-secondary shadow-sm"
            >
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-home-health"
                  aria-hidden
                />
                <p>
                  <strong className="text-text-primary">Works in any browser.</strong>{" "}
                  Automatic device discovery uses a lightweight Mac connector;
                  Windows support is planned. We never sell your personal data. Read
                  exactly what we store in our{" "}
                  <a href="/trust" className="font-semibold text-interaction underline underline-offset-4">
                    Trust Center
                  </a>
                  .
                </p>
              </div>
            </motion.div>
          </motion.div>

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
