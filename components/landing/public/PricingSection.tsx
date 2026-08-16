"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type PricingSectionProps = {
  isSignedIn?: boolean;
};

const freeFeatures = [
  "Up to 8 devices",
  "Up to 25 documents",
  "Device records",
  "Receipt storage",
  "Warranty tracking",
  "Manual and document storage",
  "Purchase information",
  "Serial and model numbers",
];

const proFeatures = [
  "More devices and documents",
  "Expanded warranty tracking",
  "Advanced Home Health features",
  "Additional organization tools",
  "More room for your growing vault",
];

const familyFeatures = [
  "Household sharing",
  "Multiple household members",
  "Shared device information",
  "More devices and documents",
  "Built for larger households",
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

export default function PricingSection({
  isSignedIn = false,
}: PricingSectionProps) {
  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;

  const primaryLabel = isSignedIn
    ? "Open My Vault"
    : "Create My Free Vault";

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-surface-base px-5 py-20 md:px-8 md:py-24 lg:px-12"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-home-health-soft/30 via-transparent to-premium-soft/25 blur-3xl" />

      <div className={landingTheme.sectionNarrow}>
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className={`${landingTheme.pill} mx-auto`}
          >
            <Sparkles
              size={14}
              className="text-home-health"
              aria-hidden
            />
            <span>Start without paying</span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-6 text-3xl font-medium tracking-[-0.04em] text-text-primary sm:text-4xl md:text-5xl"
          >
            Build your first Home Tech Vault
            <span className="block bg-gradient-to-r from-text-primary via-home-health to-premium bg-clip-text text-transparent">
              for free.
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg"
          >
            You do not need a subscription to find out whether Home Tech Vault
            is useful for your home. Start with the free plan, add a few
            devices, and upgrade only if your vault grows beyond it.
          </motion.p>
        </motion.div>

        {/* Free plan hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-[30px] border-2 border-home-health/30 bg-surface-card shadow-lift"
        >
          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            {/* Price */}
            <div className="border-b border-border-subtle bg-home-health-soft/20 p-7 sm:p-9 lg:border-b-0 lg:border-r">
              <div className="inline-flex items-center gap-2 rounded-full border border-home-health/20 bg-home-health-soft px-3 py-1.5 text-[11px] font-semibold text-home-health">
                <CheckCircle2
                  size={13}
                  aria-hidden
                />
                Recommended starting point
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                Free
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-[-0.055em] text-text-primary sm:text-6xl">
                  $0
                </span>

                <span className="pb-2 text-sm font-medium text-text-muted">
                  to start
                </span>
              </div>

              <p className="mt-4 max-w-md text-sm leading-6 text-text-secondary">
                Enough room to organize your most important technology and see
                whether Home Tech Vault fits the way you manage your home.
              </p>

              <Link
                href={primaryHref}
                className={`${landingTheme.btnPrimary} mt-7 w-full justify-center sm:w-auto`}
              >
                {primaryLabel}

                <ArrowRight
                  size={16}
                  className="ml-2.5"
                  aria-hidden
                />
              </Link>

              {!isSignedIn && (
                <p className="mt-4 text-xs font-medium text-text-muted">
                  No credit card required.
                </p>
              )}
            </div>

            {/* Features */}
            <div className="p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                Everything you need to start
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {freeFeatures.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-2.5"
                  >
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-home-health-soft">
                      <CheckCircle2
                        size={12}
                        className="text-home-health"
                        aria-hidden
                      />
                    </div>

                    <span className="text-sm leading-5 text-text-secondary">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-2xl border border-border-subtle bg-surface-sunken/40 p-5">
                <p className="text-sm font-semibold text-text-primary">
                  Start with your most important devices.
                </p>

                <p className="mt-2 text-xs leading-5 text-text-muted">
                  Your TV, refrigerator, computer, router, washer, dryer, or
                  anything else you want to keep organized. You can decide
                  later whether you need more space.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upgrade section */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto mt-14 max-w-3xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
            Need more later?
          </p>

          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
            Your plan can grow with your vault.
          </h3>

          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Pro and Family options are available when you need more devices,
            more documents, or household sharing.
          </p>
        </motion.div>

        {/* Paid plans */}
        <div className="mx-auto mt-8 grid max-w-5xl gap-5 md:grid-cols-2">
          <PlanCard
            icon={Crown}
            name="Pro"
            eyebrow="For growing vaults"
            description="For homeowners who want more room and more advanced Home Tech Vault features."
            features={proFeatures}
          />

          <PlanCard
            icon={ShieldCheck}
            name="Family"
            eyebrow="For shared households"
            description="For households that want to keep important home technology information accessible to more than one person."
            features={familyFeatures}
          />
        </div>

        {/* Don't overthink it */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto mt-14 max-w-4xl rounded-[26px] border border-border-subtle bg-surface-sunken/40 p-6 text-center sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-home-health">
            No decision required today
          </p>

          <h3 className="mt-3 text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
            Do not choose a subscription.
            <span className="block">
              Just add your first device.
            </span>
          </h3>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            The easiest way to understand Home Tech Vault is to use it. Create
            your free vault, add something you own, and see whether having the
            information organized makes your life easier.
          </p>

          <Link
            href={primaryHref}
            className={`${landingTheme.btnPrimary} mt-6`}
          >
            {primaryLabel}

            <ArrowRight
              size={16}
              className="ml-2.5"
              aria-hidden
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

type PlanCardProps = {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean;
  }>;
  name: string;
  eyebrow: string;
  description: string;
  features: string[];
};

function PlanCard({
  icon: Icon,
  name,
  eyebrow,
  description,
  features,
}: PlanCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="rounded-[24px] border border-border-subtle bg-surface-card p-6 sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-premium-soft text-premium">
          <Icon
            size={20}
            aria-hidden
          />
        </div>

        <span className="rounded-full border border-border-subtle bg-surface-sunken px-3 py-1 text-[10px] font-semibold text-text-muted">
          Upgrade when needed
        </span>
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-premium">
        {eyebrow}
      </p>

      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
        {name}
      </h3>

      <p className="mt-3 text-sm leading-6 text-text-secondary">
        {description}
      </p>

      <div className="mt-6 space-y-3">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-start gap-2.5"
          >
            <CheckCircle2
              size={16}
              className="mt-0.5 shrink-0 text-home-health"
              aria-hidden
            />

            <span className="text-sm text-text-secondary">
              {feature}
            </span>
          </div>
        ))}
      </div>
    </motion.article>
  );
}