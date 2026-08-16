"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  Receipt,
  ShieldCheck,
  Wrench,
} from "lucide-react";

export default function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* Ambient glow */}
      <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-home-health-soft via-premium-soft to-interaction-soft opacity-80 blur-3xl" />

      {/* Floating receipt card */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-4 -top-5 z-20 hidden items-center gap-2.5 rounded-2xl border border-border-subtle/80 bg-surface-card/95 px-4 py-2.5 text-xs font-semibold text-text-primary shadow-lift backdrop-blur-md sm:flex"
      >
        <Receipt
          size={15}
          className="shrink-0 text-home-health"
          aria-hidden
        />
        <span>Receipt saved</span>
      </motion.div>

      {/* Floating warranty card */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute -bottom-5 -right-4 z-20 flex items-center gap-2.5 rounded-2xl border border-border-subtle/80 bg-surface-card/95 px-4 py-2.5 text-xs font-semibold text-text-primary shadow-lift backdrop-blur-md"
      >
        <ShieldCheck
          size={15}
          className="shrink-0 text-home-health"
          aria-hidden
        />
        <span>Warranty active</span>
      </motion.div>

      {/* Main device card */}
      <div className="relative overflow-hidden rounded-[28px] border border-border-subtle bg-surface-card/95 p-5 shadow-lift backdrop-blur-xl sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle/60 pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Home Tech Vault
            </p>

            <p className="mt-1 text-sm font-semibold text-text-primary">
              Living Room TV
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-home-health/20 bg-home-health-soft px-3 py-1 text-[11px] font-semibold text-home-health">
            <CheckCircle2
              size={13}
              aria-hidden
            />
            Organized
          </div>
        </div>

        {/* Device identity */}
        <div className="mt-5 rounded-2xl border border-border-subtle/70 bg-surface-sunken/50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Device
              </p>

              <h3 className="mt-1 text-lg font-semibold tracking-tight text-text-primary">
                Samsung 65&quot; OLED TV
              </h3>

              <p className="mt-1 text-xs text-text-muted">
                Living Room
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
              <ShieldCheck
                size={20}
                aria-hidden
              />
            </div>
          </div>
        </div>

        {/* Key information */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <InfoCard
            label="Purchase date"
            value="May 8, 2026"
          />

          <InfoCard
            label="Warranty"
            value="Active"
            highlight
          />

          <InfoCard
            label="Model"
            value="QN65S90D"
          />

          <InfoCard
            label="Serial number"
            value="••••••9482"
          />
        </div>

        {/* Documents */}
        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Documents
          </p>

          <div className="mt-2 space-y-2.5">
            <DocumentRow
              icon={<Receipt size={16} />}
              title="Purchase Receipt"
              detail="Best Buy · May 8, 2026"
            />

            <DocumentRow
              icon={<ShieldCheck size={16} />}
              title="Warranty Information"
              detail="Coverage through May 8, 2027"
            />

            <DocumentRow
              icon={<FileText size={16} />}
              title="Owner's Manual"
              detail="Samsung QN65S90D"
            />
          </div>
        </div>

        {/* Service info */}
        <div className="mt-5 rounded-2xl border border-border-subtle/70 bg-surface-sunken/40 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-interaction-soft text-interaction">
              <Wrench
                size={16}
                aria-hidden
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-text-primary">
                Everything ready when you need it
              </p>

              <p className="mt-1 text-[11px] leading-5 text-text-muted">
                Receipt, model number, serial number, warranty details,
                and manual — all attached to the device.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-border-subtle/60 pt-4">
          <div className="flex items-center gap-2 text-[11px] font-medium text-text-muted">
            <ShieldCheck
              size={13}
              className="text-home-health"
              aria-hidden
            />
            Private household vault
          </div>

          <span className="text-[11px] font-semibold text-text-primary">
            1 device organized
          </span>
        </div>
      </div>
    </div>
  );
}

type InfoCardProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function InfoCard({
  label,
  value,
  highlight = false,
}: InfoCardProps) {
  return (
    <div className="rounded-xl border border-border-subtle/70 bg-surface-card p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </p>

      <p
        className={`mt-1 text-xs font-semibold ${
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

type DocumentRowProps = {
  icon: React.ReactNode;
  title: string;
  detail: string;
};

function DocumentRow({
  icon,
  title,
  detail,
}: DocumentRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle/80 bg-surface-card/80 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-home-health-soft text-home-health">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-text-primary">
            {title}
          </p>

          <p className="mt-0.5 truncate text-[10px] text-text-muted">
            {detail}
          </p>
        </div>
      </div>

      <CheckCircle2
        size={16}
        className="shrink-0 text-home-health"
        aria-hidden
      />
    </div>
  );
}