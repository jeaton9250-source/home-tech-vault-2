"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Mail,
  Receipt,
  Search,
  ShieldCheck,
  Tag,
} from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
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

export default function RealLifeUseCasesSection() {
  return (
    <section className="relative overflow-hidden bg-surface-sunken/30 px-5 py-16 md:px-8 md:py-20 lg:px-12">
      <div className={landingTheme.sectionNarrow}>
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

            <span>A normal homeowner problem</span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-6 text-3xl font-medium tracking-[-0.04em] text-text-primary sm:text-4xl md:text-5xl"
          >
            Your TV stops working tomorrow.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg"
          >
            Could you find the receipt, warranty, model number, serial number,
            and manual without searching half your house?
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto mt-12 max-w-5xl"
        >
          <div className="grid overflow-hidden rounded-[28px] border border-border-subtle bg-surface-card shadow-sm md:grid-cols-2">
            {/* Without HTV */}
            <div className="border-b border-border-subtle p-6 sm:p-8 md:border-b-0 md:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                Without Home Tech Vault
              </p>

              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-text-primary">
                Now the hunt starts.
              </h3>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                The information exists. You just have to remember where you
                put it.
              </p>

              <div className="mt-6 space-y-3">
                <ProblemRow
                  icon={Mail}
                  text="Search old emails for the receipt"
                />

                <ProblemRow
                  icon={Search}
                  text="Google the model and hope you find the right manual"
                />

                <ProblemRow
                  icon={Tag}
                  text="Move the TV to read the tiny serial number"
                />

                <ProblemRow
                  icon={ShieldCheck}
                  text="Figure out whether the warranty is still active"
                />
              </div>
            </div>

            {/* With HTV */}
            <div className="bg-home-health-soft/20 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-home-health">
                With Home Tech Vault
              </p>

              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-text-primary">
                Open the TV. It&apos;s all there.
              </h3>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Everything important stays with the thing it belongs to.
              </p>

              <div className="mt-6 space-y-3">
                <SavedRow
                  label="Receipt"
                  value="Saved"
                />

                <SavedRow
                  label="Warranty"
                  value="Active"
                />

                <SavedRow
                  label="Serial number"
                  value="Available"
                />

                <SavedRow
                  label="Owner&apos;s manual"
                  value="Saved"
                />

                <SavedRow
                  label="Purchase date"
                  value="May 8, 2026"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto mt-10 max-w-2xl text-center"
        >
          <p className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
            Save it before you need it.
          </p>

          <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">
            That&apos;s really what Home Tech Vault is for.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

type ProblemRowProps = {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean;
  }>;
  text: string;
};

function ProblemRow({
  icon: Icon,
  text,
}: ProblemRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-surface-sunken/50 p-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-card text-text-muted">
        <Icon
          size={15}
          aria-hidden
        />
      </div>

      <span className="pt-1 text-sm leading-5 text-text-secondary">
        {text}
      </span>
    </div>
  );
}

function SavedRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-home-health/15 bg-surface-card p-3.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-home-health-soft">
          <CheckCircle2
            size={13}
            className="text-home-health"
            aria-hidden
          />
        </div>

        <span className="text-sm font-medium text-text-primary">
          {label}
        </span>
      </div>

      <span className="text-xs font-semibold text-home-health">
        {value}
      </span>
    </div>
  );
}