"use client";

import Link from "next/link";

import {
  ArrowRight,
  Check,
  FileText,
  Laptop,
  Network,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type HeroSectionProps = {
  isSignedIn?: boolean;
};

const quickFeatures = [
  {
    icon: Laptop,
    label: "Devices",
  },
  {
    icon: FileText,
    label: "Documents",
  },
  {
    icon: ShieldCheck,
    label: "Warranties",
  },
  {
    icon: Network,
    label: "Network",
  },
  {
    icon: Wrench,
    label: "Maintenance",
  },
];

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
    <section className="relative overflow-hidden bg-surface-base px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24 lg:px-12">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[650px] w-[1000px] -translate-x-1/2 rounded-full bg-home-health-soft/40 blur-3xl" />

      <div className="mx-auto grid max-w-[var(--content-max)] items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        {/* LEFT */}

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-home-health/15 bg-home-health-soft px-3 py-1.5 text-xs font-semibold text-home-health">
            <Sparkles size={14} />

            Your home technology, organized
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-text-primary sm:text-5xl lg:text-[4.15rem] lg:leading-[1.03]">
            Everything about your home
            technology.
            <br />
            Finally in one place.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
            Keep your devices, receipts,
            warranties, manuals, maintenance
            records, subscriptions, and
            network information organized
            inside one secure Home Tech Vault.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-home-health px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              {primaryLabel}

              <ArrowRight size={17} />
            </Link>

            <a
              href="#vault-overview"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-6 text-sm font-semibold text-text-primary transition hover:bg-surface-sunken"
            >
              Explore the Vault
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            <TrustItem text="No credit card" />
            <TrustItem text="Start with one device" />
            <TrustItem text="Built for homeowners" />
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {quickFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-card px-3 py-1.5 text-xs font-medium text-text-secondary"
                >
                  <Icon
                    size={13}
                    className="text-home-health"
                  />

                  {feature.label}
                </div>
              );
            })}

            <div className="inline-flex items-center gap-1.5 rounded-full border border-home-health/20 bg-home-health-soft px-3 py-1.5 text-xs font-semibold text-home-health">
              <Sparkles size={13} />
              Smart Import™
            </div>
          </div>
        </div>

        {/* VAULT VISUAL */}

        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-full bg-home-health-soft/45 blur-3xl" />

          <div className="overflow-hidden rounded-[30px] border border-border-subtle bg-surface-card shadow-xl">
            <div className="border-b border-border-subtle px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                    Home Tech Vault
                  </p>

                  <p className="mt-1 font-semibold text-text-primary">
                    Sample Home
                  </p>
                </div>

                <span className="rounded-full bg-home-health-soft px-2.5 py-1 text-[10px] font-semibold text-home-health">
                  DEMO
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
              <StatCard
                label="Devices"
                value="18"
              />

              <StatCard
                label="Documents"
                value="34"
              />

              <StatCard
                label="Warranties"
                value="7"
              />

              <StatCard
                label="Maintenance"
                value="4"
              />

              <StatCard
                label="Subscriptions"
                value="6"
              />

              <StatCard
                label="Network"
                value="12"
              />
            </div>

            <div className="border-t border-border-subtle p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                Recently organized
              </p>

              <div className="mt-4 space-y-3">
                <DeviceRow
                  name='LG 34" UltraWide Monitor'
                  meta="Office • Warranty tracked"
                />

                <DeviceRow
                  name="Apple TV 4K"
                  meta="Living Room • Receipt saved"
                />

                <DeviceRow
                  name="Eero Pro 6E"
                  meta="Network • Manual attached"
                />
              </div>
            </div>

            <div className="border-t border-border-subtle bg-home-health-soft/35 px-5 py-4">
              <div className="flex items-center gap-2">
                <Sparkles
                  size={15}
                  className="text-home-health"
                />

                <p className="text-xs font-semibold text-text-primary">
                  Smart Import ready for your next purchase
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustItem({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
      <Check
        size={13}
        className="text-home-health"
      />

      {text}
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-sunken/60 p-4">
      <p className="text-2xl font-semibold tracking-tight text-text-primary">
        {value}
      </p>

      <p className="mt-1 text-xs text-text-muted">
        {label}
      </p>
    </div>
  );
}

function DeviceRow({
  name,
  meta,
}: {
  name: string;
  meta: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-base px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
        <Laptop size={16} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text-primary">
          {name}
        </p>

        <p className="mt-0.5 truncate text-xs text-text-muted">
          {meta}
        </p>
      </div>
    </div>
  );
}