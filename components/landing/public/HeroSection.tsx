"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Play,
  Sparkles,
} from "lucide-react";

import HeroVisual from "@/components/landing/public/HeroVisual";
import ProductTourModal from "@/components/landing/public/ProductTourModal";
import LandingTrackedLink from "@/components/landing/public/LandingTrackedLink";
import { landingTheme } from "@/components/landing/public/landingTheme";
import { LANDING_ANALYTICS_EVENTS } from "@/lib/marketing/landingAnalytics";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type HeroSectionProps = {
  isSignedIn?: boolean;
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: custom * 0.09,
      ease: [
        0.22,
        1,
        0.36,
        1,
      ] as const,
    },
  }),
};

const HERO_POINTS = [
  "Organize every device and document",
  "Monitor your home network",
  "Control supported smart-home devices",
] as const;

export default function HeroSection({
  isSignedIn = false,
}: HeroSectionProps) {
  const [
    productTourOpen,
    setProductTourOpen,
  ] = useState(false);

  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.demo;

  const primaryLabel = isSignedIn
    ? "Open HomeCore"
    : "Explore HomeCore";

  return (
    <section className="relative overflow-hidden bg-surface-base px-5 py-20 md:px-8 md:py-28 lg:px-12 lg:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-home-health-soft/60 via-premium-soft/25 to-transparent blur-3xl" />

      <div className={landingTheme.sectionNarrow}>
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className={landingTheme.pill}
            >
              <Sparkles
                size={14}
                className="text-home-health"
              />

              <span>
                Home Tech Vault presents HomeCore
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mt-6 max-w-2xl text-5xl font-medium leading-[0.98] tracking-[-0.055em] text-text-primary sm:text-6xl lg:text-7xl"
            >
              The command center for
              your home technology.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-7 max-w-xl text-lg leading-8 text-text-secondary md:text-xl"
            >
              <strong className="font-semibold text-text-primary">
                HomeCore
              </strong>{" "}
              brings your devices, network,
              warranties, documents, maintenance,
              and smart-home controls together in
              one simple command center.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <LandingTrackedLink
                href={primaryHref}
                eventName={
                  LANDING_ANALYTICS_EVENTS
                    .heroExploreDemo
                }
                className={landingTheme.btnPrimary}
              >
                {primaryLabel}

                <ArrowRight
                  size={16}
                  className="ml-2"
                />
              </LandingTrackedLink>

              <button
                type="button"
                onClick={() => {
                  setProductTourOpen(true);
                }}
                className={
                  landingTheme.btnSecondary
                }
              >
                <Play
                  size={15}
                  className="mr-2"
                />

                Watch the Product Tour
              </button>
            </motion.div>

            <motion.ul
              variants={fadeUp}
              custom={4}
              className="mt-9 space-y-3"
            >
              {HERO_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-3 text-sm font-medium text-text-secondary"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-home-health-soft text-home-health">
                    <Check size={14} />
                  </span>

                  {point}
                </li>
              ))}
            </motion.ul>

            <motion.p
              variants={fadeUp}
              custom={5}
              className="mt-8 text-xs font-medium uppercase tracking-[0.14em] text-text-muted"
            >
              No complicated smart-home setup
              required to get started
            </motion.p>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
      <ProductTourModal
        open={productTourOpen}
        onClose={() => {
          setProductTourOpen(false);
        }}
      />
    </section>
  );
}
