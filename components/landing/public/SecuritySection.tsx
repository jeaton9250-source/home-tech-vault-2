"use client";

import { motion } from "framer-motion";
import {
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";

const securityPoints = [
  {
    icon: Lock,
    title: "Private by default",
    description:
      "Your household information stays associated with your account and is not meant to be publicly visible.",
  },
  {
    icon: KeyRound,
    title: "Secure account access",
    description:
      "Home Tech Vault uses authenticated account access so your vault is tied to the people you authorize.",
  },
  {
    icon: UserRoundCheck,
    title: "You control household access",
    description:
      "Choose who can access shared household information instead of passing documents and screenshots around.",
  },
  {
    icon: EyeOff,
    title: "Your personal data is not for sale",
    description:
      "Home Tech Vault is built to organize your home information, not to sell your personal data to advertisers.",
  },
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

export default function SecuritySection() {
  return (
    <section className="relative overflow-hidden bg-surface-sunken/35 px-5 py-20 md:px-8 md:py-24 lg:px-12">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-home-health-soft/30 via-transparent to-premium-soft/25 blur-3xl" />

      <div className={landingTheme.sectionNarrow}>
        {/* Intro */}
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
            <ShieldCheck
              size={14}
              className="text-home-health"
              aria-hidden
            />
            <span>Your information matters</span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-6 text-3xl font-medium tracking-[-0.04em] text-text-primary sm:text-4xl md:text-5xl"
          >
            Your home information should feel
            <span className="block bg-gradient-to-r from-text-primary via-home-health to-premium bg-clip-text text-transparent">
              safe to store.
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg"
          >
            Receipts, serial numbers, warranties, purchase records, and
            household details can be sensitive. Home Tech Vault is designed
            around keeping that information organized and under your control.
          </motion.p>
        </motion.div>

        {/* Main trust card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto mt-14 max-w-6xl overflow-hidden rounded-[28px] border border-border-subtle bg-surface-card shadow-lift"
        >
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            {/* Left side */}
            <div className="border-b border-border-subtle p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
                <ShieldCheck
                  size={26}
                  aria-hidden
                />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-home-health">
                Your vault
              </p>

              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
                Built for private household information.
              </h3>

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                The information you add to Home Tech Vault is there to help
                you manage your home — not to become a public profile.
              </p>

              <div className="mt-6 rounded-2xl border border-border-subtle bg-surface-sunken/45 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  Example information
                </p>

                <div className="mt-4 space-y-3">
                  <PrivateItem text="Device serial numbers" />
                  <PrivateItem text="Purchase receipts" />
                  <PrivateItem text="Warranty documents" />
                  <PrivateItem text="Household device records" />
                  <PrivateItem text="Maintenance information" />
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                What you should expect
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {securityPoints.map((point, index) => {
                  const Icon = point.icon;

                  return (
                    <motion.div
                      key={point.title}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.05,
                      }}
                      className="rounded-2xl border border-border-subtle bg-surface-sunken/35 p-5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
                        <Icon
                          size={18}
                          aria-hidden
                        />
                      </div>

                      <h4 className="mt-4 text-sm font-semibold text-text-primary">
                        {point.title}
                      </h4>

                      <p className="mt-2 text-xs leading-5 text-text-muted">
                        {point.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border border-home-health/15 bg-home-health-soft/20 p-5">
                <div className="flex items-start gap-3">
                  <Lock
                    size={18}
                    className="mt-0.5 shrink-0 text-home-health"
                    aria-hidden
                  />

                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      You decide what goes into your vault.
                    </p>

                    <p className="mt-1 text-xs leading-5 text-text-muted">
                      Add the information that is useful to you. You are not
                      required to document every device, upload every receipt,
                      or share household access with anyone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust statement */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto mt-12 max-w-3xl text-center"
        >
          <p className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
            Your Home Tech Vault should work for you — not the other way
            around.
          </p>

          <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">
            Keep what matters organized, control who can access it, and build
            your vault at your own pace.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function PrivateItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-home-health-soft">
        <Lock
          size={11}
          className="text-home-health"
          aria-hidden
        />
      </div>

      <span className="text-sm text-text-secondary">
        {text}
      </span>
    </div>
  );
}