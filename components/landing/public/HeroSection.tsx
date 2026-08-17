"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Home,
} from "lucide-react";

import HeroVisual from "@/components/landing/public/HeroVisual";
import { landingTheme } from "@/components/landing/public/landingTheme";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type HeroSectionProps = {
  isSignedIn?: boolean;
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: custom * 0.07,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function HeroSection({
  isSignedIn = false,
}: HeroSectionProps) {
  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;

  const primaryLabel = isSignedIn
    ? "Open My Vault"
    : "Create My Free Vault";

  return (
    <section className="relative overflow-hidden bg-surface-base px-5 pb-16 pt-16 md:px-8 md:pb-20 md:pt-20 lg:px-12">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-home-health-soft/30 blur-3xl" />

      <div className={landingTheme.sectionNarrow}>
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-3.5 py-2 text-sm font-medium text-text-secondary shadow-sm"
            >
              <Home
                size={14}
                className="text-home-health"
                aria-hidden
              />

              <span>A simpler way to keep track of your home</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mt-6 max-w-2xl text-4xl font-medium tracking-[-0.045em] text-text-primary sm:text-5xl md:text-[3.45rem] lg:text-[3.8rem] lg:leading-[1.04]"
            >
              Never lose another receipt, warranty, manual, or serial number.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 max-w-xl text-lg leading-8 text-text-secondary sm:text-xl"
            >
              Keep the important details about the things in your home
              together, so when something breaks, needs service, or gets
              replaced, you know exactly where to look.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <Link
                href={primaryHref}
                className={landingTheme.btnPrimary}
              >
                {primaryLabel}

                <ArrowRight
                  size={16}
                  className="ml-2.5"
                  aria-hidden
                />
              </Link>

              <Link
                href={MARKETING_ROUTES.demo}
                className={landingTheme.btnSecondary}
              >
                See How It Works
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-muted"
            >
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  size={14}
                  className="text-home-health"
                  aria-hidden
                />
                Free to start
              </span>

              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  size={14}
                  className="text-home-health"
                  aria-hidden
                />
                No credit card
              </span>

              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  size={14}
                  className="text-home-health"
                  aria-hidden
                />
                Start with one device
              </span>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={5}
              className="mt-9 max-w-xl rounded-2xl border border-border-subtle bg-surface-card/80 p-4 shadow-sm"
            >
              <p className="text-sm font-semibold text-text-primary">
                Start with something you already own.
              </p>

              <p className="mt-1 text-sm leading-6 text-text-secondary">
                Add your TV, refrigerator, washer, computer, router, or
                anything else you&apos;d want information about later.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.98,
              y: 14,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.16,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}