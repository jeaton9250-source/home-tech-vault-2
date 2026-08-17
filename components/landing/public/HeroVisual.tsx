"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  Receipt,
  ShieldCheck,
  Tv,
} from "lucide-react";

export default function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* Soft household glow */}
      <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-home-health-soft/45 via-surface-sunken/40 to-premium-soft/30 blur-3xl" />

      {/* Small floating note */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-3 top-10 z-20 hidden rounded-2xl border border-border-subtle bg-surface-card/95 px-4 py-3 shadow-lift backdrop-blur-md sm:block"
      >
        <div className="flex items-center gap-2">
          <Receipt
            size={15}
            className="text-home-health"
            aria-hidden
          />

          <p className="text-xs font-semibold text-text-primary">
            Receipt saved
          </p>
        </div>

        <p className="mt-1 text-[10px] text-text-muted">
          Best Buy · May 8, 2026
        </p>
      </motion.div>

      {/* Small floating note */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 6.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        }}
        className="absolute -bottom-4 right-2 z-20 rounded-2xl border border-border-subtle bg-surface-card/95 px-4 py-3 shadow-lift backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck
            size={15}
            className="text-home-health"
            aria-hidden
          />

          <p className="text-xs font-semibold text-text-primary">
            Warranty covered
          </p>
        </div>

        <p className="mt-1 text-[10px] text-text-muted">
          Through May 8, 2027
        </p>
      </motion.div>

      {/* Main personal device record */}
      <div className="relative overflow-hidden rounded-[32px] border border-border-subtle bg-surface-card/95 p-5 shadow-lift backdrop-blur-xl sm:p-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
              <Tv size={20} aria-hidden />
            </div>

            <div>
              <p className="text-xs font-medium text-text-muted">
                Living Room
              </p>

              <h3 className="mt-0.5 text-lg font-semibold tracking-tight text-text-primary">
                Samsung 65&quot; OLED TV
              </h3>
            </div>
          </div>

          <span className="hidden rounded-full bg-home-health-soft px-3 py-1 text-[10px] font-semibold text-home-health sm:inline-flex">
            All set
          </span>
        </div>

        <div className="mt-6 rounded-2xl bg-surface-sunken/45 p-4">
          <p className="text-sm font-semibold text-text-primary">
            The important stuff
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SimpleDetail
              label="Bought"
              value="May 8, 2026"
            />

            <SimpleDetail
              label="Warranty"
              value="Active"
              highlight
            />

            <SimpleDetail
              label="Model"
              value="QN65S90D"
            />

            <SimpleDetail
              label="Serial"
              value="••••••9482"
            />
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold text-text-primary">
            Saved with this TV
          </p>

          <div className="mt-3 space-y-3">
            <SavedItem
              icon={<Receipt size={16} />}
              title="Purchase receipt"
              subtitle="Best Buy · May 8, 2026"
            />

            <SavedItem
              icon={<ShieldCheck size={16} />}
              title="Warranty"
              subtitle="Coverage through May 8, 2027"
            />

            <SavedItem
              icon={<FileText size={16} />}
              title="Owner's manual"
              subtitle="Samsung QN65S90D"
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-home-health/15 bg-home-health-soft/35 p-4">
          <p className="text-sm font-semibold text-text-primary">
            If this TV stopped working tomorrow...
          </p>

          <p className="mt-1 text-sm leading-6 text-text-secondary">
            You&apos;d already have the receipt, warranty, model,
            serial number, and manual ready.
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border-subtle pt-4">
          <p className="text-[11px] text-text-muted">
            One thing in your home, organized.
          </p>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-home-health">
            <CheckCircle2 size={13} aria-hidden />
            Ready when needed
          </div>
        </div>
      </div>
    </div>
  );
}

type SimpleDetailProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function SimpleDetail({
  label,
  value,
  highlight = false,
}: SimpleDetailProps) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-semibold ${
          highlight
            ? "text-home-health"
            : "text-text-primary"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

type SavedItemProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
};

function SavedItem({
  icon,
  title,
  subtitle,
}: SavedItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-card p-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-sunken text-home-health">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">
            {title}
          </p>

          <p className="mt-0.5 truncate text-[11px] text-text-muted">
            {subtitle}
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