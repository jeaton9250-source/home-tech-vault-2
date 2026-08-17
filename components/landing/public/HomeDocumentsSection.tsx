"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  FolderOpen,
  Receipt,
  ShieldCheck,
  Tv,
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

export default function HomeDocumentsSection() {
  return (
    <section className="relative overflow-hidden bg-surface-base px-5 py-16 md:px-8 md:py-20 lg:px-12">
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
            <FolderOpen
              size={14}
              className="text-home-health"
              aria-hidden
            />

            <span>Keep the important stuff together</span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-6 text-3xl font-medium tracking-[-0.04em] text-text-primary sm:text-4xl md:text-5xl"
          >
            Everything about the things in your home,
            <span className="block">
              where you can actually find it.
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg"
          >
            Receipts, warranties, manuals, serial numbers, and purchase
            details stay with the device they belong to.
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
          className="mx-auto mt-12 max-w-4xl"
        >
          <div className="overflow-hidden rounded-[28px] border border-border-subtle bg-surface-card shadow-sm">
            <div className="flex items-center gap-4 border-b border-border-subtle p-5 sm:p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
                <Tv size={21} aria-hidden />
              </div>

              <div>
                <p className="text-xs text-text-muted">
                  Living Room
                </p>

                <h3 className="mt-0.5 text-lg font-semibold tracking-tight text-text-primary">
                  Samsung 65&quot; OLED TV
                </h3>
              </div>
            </div>

            <div className="grid gap-0 md:grid-cols-2">
              <div className="border-b border-border-subtle p-5 sm:p-6 md:border-b-0 md:border-r">
                <p className="text-sm font-semibold text-text-primary">
                  The details you&apos;ll need later
                </p>

                <div className="mt-5 space-y-4">
                  <DetailRow
                    label="Purchased"
                    value="May 8, 2026"
                  />

                  <DetailRow
                    label="Warranty"
                    value="Active"
                    highlight
                  />

                  <DetailRow
                    label="Model"
                    value="QN65S90D"
                  />

                  <DetailRow
                    label="Serial number"
                    value="••••••9482"
                  />
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-sm font-semibold text-text-primary">
                  Saved with this TV
                </p>

                <div className="mt-5 space-y-3">
                  <SavedDocument
                    icon={<Receipt size={16} />}
                    title="Purchase receipt"
                    detail="Best Buy · May 8, 2026"
                  />

                  <SavedDocument
                    icon={<ShieldCheck size={16} />}
                    title="Warranty"
                    detail="Coverage through May 8, 2027"
                  />

                  <SavedDocument
                    icon={<FileText size={16} />}
                    title="Owner&apos;s manual"
                    detail="Samsung QN65S90D"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mx-auto mt-10 max-w-2xl text-center"
        >
          <p className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
            No more guessing which drawer, inbox, folder, or box it&apos;s in.
          </p>

          <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">
            Open the thing you own. The important information is right there.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function DetailRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border-subtle/70 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-text-secondary">
        {label}
      </span>

      <span
        className={`text-sm font-semibold ${
          highlight
            ? "text-home-health"
            : "text-text-primary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function SavedDocument({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-card p-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">
            {title}
          </p>

          <p className="mt-0.5 truncate text-[11px] text-text-muted">
            {detail}
          </p>
        </div>
      </div>

      <CheckCircle2
        size={15}
        className="shrink-0 text-home-health"
        aria-hidden
      />
    </div>
  );
}