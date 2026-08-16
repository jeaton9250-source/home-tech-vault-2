"use client";

import { motion } from "framer-motion";
import {
  FileSearch,
  PackageSearch,
  Receipt,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";

const scenarios = [
  {
    icon: Wrench,
    label: "Something breaks",
    title: "Your TV stops working.",
    description:
      "Instead of digging through drawers and old emails, open the device and instantly find its model number, serial number, receipt, warranty, and manual.",
    items: [
      "Model number",
      "Serial number",
      "Purchase receipt",
      "Warranty details",
    ],
  },
  {
    icon: ShieldCheck,
    label: "You need warranty service",
    title: "Is your appliance still covered?",
    description:
      "See when you bought it, when the warranty ends, and keep the documents you may need for a claim attached to the device.",
    items: [
      "Purchase date",
      "Warranty expiration",
      "Proof of purchase",
      "Supporting documents",
    ],
  },
  {
    icon: FileSearch,
    label: "You need information",
    title: "Support asks for the serial number.",
    description:
      "Skip moving furniture, checking tiny labels, or searching through packaging. Keep important device information ready before you need it.",
    items: [
      "Serial number",
      "Model information",
      "Device notes",
      "Manuals",
    ],
  },
  {
    icon: PackageSearch,
    label: "You replace something",
    title: "What exactly did you own before?",
    description:
      "Look back at the brand, model, purchase date, price, and documents from the device you're replacing.",
    items: [
      "Brand and model",
      "Purchase history",
      "Original price",
      "Device records",
    ],
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

export default function RealLifeUseCasesSection() {
  return (
    <section className="relative overflow-hidden bg-surface-base px-5 py-20 md:px-8 md:py-24 lg:px-12">
      <div className={landingTheme.sectionNarrow}>
        {/* Section intro */}
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
            <Receipt
              size={14}
              className="text-home-health"
              aria-hidden
            />
            <span>Before you need it</span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-6 text-3xl font-medium tracking-[-0.04em] text-text-primary sm:text-4xl md:text-5xl"
          >
            Your TV breaks tomorrow.
            <span className="block bg-gradient-to-r from-text-primary via-home-health to-premium bg-clip-text text-transparent">
              Could you find everything you need?
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg"
          >
            Most device information feels unimportant until something goes
            wrong. Home Tech Vault keeps it organized before that moment
            arrives.
          </motion.p>
        </motion.div>

        {/* Main problem visual */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-[28px] border border-border-subtle bg-surface-card shadow-lift"
        >
          <div className="grid md:grid-cols-2">
            {/* Without Home Tech Vault */}
            <div className="border-b border-border-subtle p-6 sm:p-8 md:border-b-0 md:border-r">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-warning" />
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                  Without Home Tech Vault
                </p>
              </div>

              <h3 className="mt-5 text-xl font-semibold tracking-tight text-text-primary">
                Something breaks.
              </h3>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Now the search begins.
              </p>

              <div className="mt-6 space-y-3">
                <ProblemRow text="Search years of email for the receipt" />
                <ProblemRow text="Move the TV to find the serial number" />
                <ProblemRow text="Google the model and hope you found the right manual" />
                <ProblemRow text="Try to remember when you bought it" />
                <ProblemRow text="Figure out whether the warranty is still active" />
              </div>
            </div>

            {/* With Home Tech Vault */}
            <div className="bg-home-health-soft/20 p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <CheckBadge />
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-home-health">
                  With Home Tech Vault
                </p>
              </div>

              <h3 className="mt-5 text-xl font-semibold tracking-tight text-text-primary">
                Open one device.
              </h3>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Everything important is already there.
              </p>

              <div className="mt-6 space-y-3">
                <SuccessRow
                  title="Receipt"
                  detail="Saved"
                />
                <SuccessRow
                  title="Warranty"
                  detail="Active"
                />
                <SuccessRow
                  title="Serial number"
                  detail="Available"
                />
                <SuccessRow
                  title="Manual"
                  detail="Attached"
                />
                <SuccessRow
                  title="Purchase date"
                  detail="May 8, 2026"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scenarios */}
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {scenarios.map((scenario, index) => {
            const Icon = scenario.icon;

            return (
              <motion.article
                key={scenario.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-[24px] border border-border-subtle bg-surface-card p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-7"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
                  <Icon
                    size={20}
                    aria-hidden
                  />
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-home-health">
                  {scenario.label}
                </p>

                <h3 className="mt-2 text-xl font-semibold tracking-tight text-text-primary">
                  {scenario.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  {scenario.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {scenario.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border-subtle bg-surface-sunken px-3 py-1.5 text-[11px] font-medium text-text-secondary"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Closing statement */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto mt-14 max-w-2xl text-center"
        >
          <p className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
            The best time to save this information is before you need it.
          </p>

          <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">
            Add one device today. Your vault can grow naturally as you buy,
            replace, and organize the technology around your home.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function ProblemRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-sunken/50 p-3">
      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-warning" />

      <span className="text-sm leading-5 text-text-secondary">
        {text}
      </span>
    </div>
  );
}

function SuccessRow({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-home-health/15 bg-surface-card p-3">
      <div className="flex items-center gap-2.5">
        <CheckCircleIcon />

        <span className="text-sm font-medium text-text-primary">
          {title}
        </span>
      </div>

      <span className="text-xs font-semibold text-home-health">
        {detail}
      </span>
    </div>
  );
}

function CheckBadge() {
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-home-health text-white">
      <ShieldCheck
        size={13}
        aria-hidden
      />
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-home-health-soft">
      <ShieldCheck
        size={12}
        className="text-home-health"
        aria-hidden
      />
    </div>
  );
}