"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from "lucide-react";

import HeroVisual from "@/components/landing/public/HeroVisual";
import { landingTheme } from "@/components/landing/public/landingTheme";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type HeroSectionProps = {
  isSignedIn?: boolean;
};

const benefits = [
  "Keep receipts, warranties, manuals, and serial numbers together",
  "Find important device details in seconds",
  "Track purchase and warranty information",
  "Start with one device and build your vault over time",
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: custom * 0.08,
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
    <section className="relative overflow-hidden bg-surface-base px-5 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-b from-home-health-soft/45 via-surface-sunken/55 to-transparent blur-3xl" />

      <div className={landingTheme.sectionNarrow}>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
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
              <ShieldCheck
                size={14}
                className="text-home-health"
                aria-hidden
              />
              <span>Your home's important information, organized</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mt-6 max-w-2xl text-4xl font-medium tracking-[-0.045em] text-text-primary sm:text-5xl md:text-[3.5rem] lg:text-[3.85rem] lg:leading-[1.05]"
            >
              Never lose another receipt, warranty, manual,{" "}
              <span className="bg-gradient-to-r from-text-primary via-home-health to-premium bg-clip-text text-transparent">
                or serial number.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 max-w-xl text-lg leading-8 text-text-secondary sm:text-xl"
            >
              Home Tech Vault keeps the important details about your
              appliances and technology in one place, so when something
              breaks, needs service, or gets replaced, you know exactly
              where to look.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-6 flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface-raised px-4 py-3.5"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-home-health-soft">
                <FileText
                  size={16}
                  className="text-home-health"
                  aria-hidden
                />
              </div>

              <p className="max-w-lg text-sm leading-6 text-text-secondary sm:text-base">
                Start with one device today. Add your TV, refrigerator,
                computer, router, or anything else you want to keep track of.
                You do not need to inventory your entire home at once.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={4}
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

            <motion.p
              variants={fadeUp}
              custom={5}
              className="mt-4 text-sm font-medium text-text-muted"
            >
              Free to start · No credit card required
            </motion.p>

            <motion.ul
              variants={fadeUp}
              custom={6}
              className="mt-8 grid gap-3 sm:grid-cols-2"
            >
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2.5 text-sm font-medium text-text-secondary"
                >
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-home-health"
                    aria-hidden
                  />

                  <span>{benefit}</span>
                </li>
              ))}
            </motion.ul>

            <motion.p
              variants={fadeUp}
              custom={7}
              className="mt-7 max-w-xl text-xs leading-5 text-text-muted sm:text-sm"
            >
              Your Home Tech Vault grows with your home. Add things when you
              buy them, save documents when you receive them, and have the
              information ready before you need it.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.65,
              delay: 0.18,
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