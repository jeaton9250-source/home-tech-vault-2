"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  PlusCircle,
  Search,
} from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";

const steps = [
  {
    number: "01",
    icon: PlusCircle,
    title: "Add one device",
    description:
      "Start with your TV, refrigerator, computer, router, or anything else you want to keep track of.",
    detail: "You do not need to inventory your entire house at once.",
  },
  {
    number: "02",
    icon: FileText,
    title: "Save the important stuff",
    description:
      "Add the model number, serial number, purchase date, warranty details, receipt, manual, and anything else you may need later.",
    detail: "Everything stays attached to the device it belongs to.",
  },
  {
    number: "03",
    icon: Search,
    title: "Find it when you need it",
    description:
      "When something breaks, needs service, or gets replaced, open the device and find the information in seconds.",
    detail: "No digging through drawers, boxes, or years of email.",
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

export default function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden bg-surface-sunken/35 px-5 py-20 md:px-8 md:py-24 lg:px-12">
      <div className={landingTheme.sectionNarrow}>
        {/* Heading */}
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
            <CheckCircle2
              size={14}
              className="text-home-health"
              aria-hidden
            />
            <span>Simple by design</span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-6 text-3xl font-medium tracking-[-0.04em] text-text-primary sm:text-4xl md:text-5xl"
          >
            Start with one device.
            <span className="block bg-gradient-to-r from-text-primary via-home-health to-premium bg-clip-text text-transparent">
              Build your vault over time.
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg"
          >
            Home Tech Vault should not feel like another project on your
            to-do list. Add what matters now, then keep building as you buy,
            replace, or organize things around your home.
          </motion.p>
        </motion.div>

        {/* 3-step flow */}
        <div className="relative mt-14 grid gap-5 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative"
              >
                <article className="h-full rounded-[24px] border border-border-subtle bg-surface-card p-6 shadow-sm sm:p-7">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
                      <Icon size={22} aria-hidden />
                    </div>

                    <span className="text-sm font-semibold tracking-[0.12em] text-text-muted">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-text-primary">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-text-secondary">
                    {step.description}
                  </p>

                  <div className="mt-5 rounded-xl border border-border-subtle bg-surface-sunken/60 p-3.5">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-home-health"
                        aria-hidden
                      />

                      <p className="text-xs leading-5 text-text-muted">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                </article>

                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 lg:flex">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-surface-base text-text-muted shadow-sm">
                      <ArrowRight size={14} aria-hidden />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Mini product walkthrough */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-[28px] border border-border-subtle bg-surface-card shadow-lift"
        >
          <div className="border-b border-border-subtle/70 px-5 py-4 sm:px-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                  Example
                </p>

                <p className="mt-1 text-sm font-semibold text-text-primary">
                  Adding your first device
                </p>
              </div>

              <span className="rounded-full border border-home-health/20 bg-home-health-soft px-3 py-1 text-[11px] font-semibold text-home-health">
                About 30 seconds to start
              </span>
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
            {/* Device input */}
            <div className="border-b border-border-subtle p-5 sm:p-7 md:border-b-0 md:border-r">
              <p className="text-xs font-semibold text-text-primary">
                What do you want to add?
              </p>

              <div className="mt-4 space-y-3">
                <MockField
                  label="Device name"
                  value="Living Room TV"
                />

                <MockField
                  label="Brand"
                  value="Samsung"
                />

                <MockField
                  label="Model"
                  value="QN65S90D"
                />
              </div>

              <div className="mt-4 rounded-xl bg-home-health px-4 py-3 text-center text-xs font-semibold text-white">
                Add Device
              </div>
            </div>

            {/* Result */}
            <div className="bg-home-health-soft/15 p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-home-health text-white">
                  <CheckCircle2 size={19} aria-hidden />
                </div>

                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Your first device is in your vault.
                  </p>

                  <p className="mt-0.5 text-xs text-text-muted">
                    Add more details whenever you are ready.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-border-subtle bg-surface-card p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Living Room TV
                </p>

                <p className="mt-1 text-base font-semibold text-text-primary">
                  Samsung QN65S90D
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <StatusItem label="Receipt" status="Add later" />
                  <StatusItem label="Warranty" status="Add later" />
                  <StatusItem label="Serial #" status="Add later" />
                  <StatusItem label="Manual" status="Add later" />
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-text-muted">
                You can save the basics first and fill in receipts, warranties,
                manuals, and serial numbers whenever it makes sense.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bottom reassurance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-12 max-w-2xl text-center"
        >
          <p className="text-lg font-semibold tracking-tight text-text-primary">
            Five minutes today can save a lot of searching later.
          </p>

          <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">
            Start small. The goal is not to document your whole house in one
            sitting. It is to make sure the information is there when you
            eventually need it.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function MockField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </p>

      <div className="rounded-xl border border-border-subtle bg-surface-sunken/50 px-3.5 py-2.5 text-xs font-medium text-text-primary">
        {value}
      </div>
    </div>
  );
}

function StatusItem({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-sunken/50 p-3">
      <p className="text-[10px] font-medium text-text-muted">
        {label}
      </p>

      <p className="mt-1 text-[11px] font-semibold text-text-primary">
        {status}
      </p>
    </div>
  );
}