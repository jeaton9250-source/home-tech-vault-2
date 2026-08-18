"use client";

import { useState } from "react";

import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Laptop,
  Network,
  Receipt,
  Router,
  ShieldCheck,
  Sparkles,
  Wifi,
  Wrench,
} from "lucide-react";

import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type HeroSectionProps = {
  isSignedIn?: boolean;
};

const categories = [
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
    icon: Wrench,
    label: "Maintenance",
  },
  {
    icon: Network,
    label: "Network",
  },
  {
    icon: Sparkles,
    label: "Smart Import",
  },
];

export default function HeroSection({
  isSignedIn = false,
}: HeroSectionProps) {
    const [activePreviewTab, setActivePreviewTab] =
    useState<
      "overview" | "devices" | "documents" | "network"
    >("overview");

const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;

  const primaryLabel = isSignedIn
    ? "Open My Vault"
    : "Create My Free Vault";

  return (
    <>
      <section className="relative overflow-hidden bg-[#0b1623] text-[#f4f0e8]">
        {/* BACKGROUND */}

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-48 top-[-260px] h-[700px] w-[700px] rounded-full bg-[#52643f]/10 blur-[120px]" />

          <div className="absolute right-[-220px] top-[30px] h-[620px] w-[620px] rounded-full bg-[#718d4f]/8 blur-[130px]" />

          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
        </div>

        <div className="relative mx-auto grid min-h-[720px] max-w-[1240px] items-center gap-16 px-5 py-20 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 lg:py-24">
          {/* LEFT */}

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/[0.025] px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7d9c54]" />

              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8ca667]">
                Your home technology, organized
              </span>
            </div>

            <h1 className="mt-8 max-w-[670px] font-serif text-[3.25rem] font-medium leading-[0.99] tracking-[-0.055em] text-[#f4f0e8] sm:text-[4.25rem] lg:text-[5rem]">
              Everything about
              <br />
              your home
              <br />
              technology.
              <br />

              <span className="text-[#718d4f]">
                Finally in one place.
              </span>
            </h1>

            <p className="mt-7 max-w-[620px] text-base leading-8 text-[#bdc5cc] sm:text-[1.05rem]">
              Keep your devices, receipts,
              warranties, manuals, maintenance
              records, subscriptions, and
              network information organized
              inside one secure Home Tech
              Vault.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={primaryHref}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-[#8ba866]/45 bg-[#617c43] px-7 text-sm font-semibold text-white shadow-[0_20px_40px_-20px_rgba(97,124,67,0.8)] transition hover:bg-[#718d4f]"
              >
                {primaryLabel}

                <ArrowRight
                  size={16}
                  aria-hidden
                />
              </Link>

              <Link
                href={MARKETING_ROUTES.demo}
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-white/55 bg-white/[0.02] px-7 text-sm font-semibold text-[#f4f0e8] transition hover:bg-white/10"
              >
                Watch the Demo
              </Link>
            </div>

            <p className="mt-5 text-xs text-white/40">
              No credit card. Start with one
              device and build your Vault at
              your own pace.
            </p>
          </div>

          {/* PRODUCT MOCKUP */}

          <div className="relative lg:pl-4">
            <div className="absolute -inset-10 -z-10 rounded-full bg-[#718d4f]/8 blur-3xl" />

            {/* MAIN APP WINDOW */}

            <div className="relative overflow-hidden rounded-[30px] border border-white/15 bg-[#101d2b] shadow-[0_40px_100px_-35px_rgba(0,0,0,0.85)]">
              {/* WINDOW TOP */}

              <div className="flex items-center justify-between border-b border-white/10 bg-[#132536] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#718d4f]/25 bg-[#718d4f]/10 text-[#8ca667]">
                    <ShieldCheck
                      size={17}
                      strokeWidth={1.7}
                    />
                  </div>

                  <div>
                    <p className="font-serif text-sm text-[#f4f0e8]">
                      Home Tech Vault
                    </p>

                    <p className="mt-0.5 text-[9px] uppercase tracking-[0.13em] text-white/30">
                      Sample Home
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.09em] text-white/40">
                  Demo
                </span>
              </div>

              {/* MINI NAV */}

              <div
                className="flex gap-5 overflow-x-auto border-b border-white/10 px-5 py-3 sm:px-6"
                role="tablist"
                aria-label="Interactive Home Tech Vault preview"
              >
                <MiniNavItem
                  label="Overview"
                  active={activePreviewTab === "overview"}
                  onClick={() =>
                    setActivePreviewTab("overview")
                  }
                />

                <MiniNavItem
                  label="Devices"
                  active={activePreviewTab === "devices"}
                  onClick={() =>
                    setActivePreviewTab("devices")
                  }
                />

                <MiniNavItem
                  label="Documents"
                  active={activePreviewTab === "documents"}
                  onClick={() =>
                    setActivePreviewTab("documents")
                  }
                />

                <MiniNavItem
                  label="Network"
                  active={activePreviewTab === "network"}
                  onClick={() =>
                    setActivePreviewTab("network")
                  }
                />
              </div>

              {/* INTERACTIVE DASHBOARD CONTENT */}

              <div className="p-5 sm:p-6">
                {activePreviewTab === "overview" && (
                  <OverviewPreview />
                )}

                {activePreviewTab === "devices" && (
                  <DevicesPreview />
                )}

                {activePreviewTab === "documents" && (
                  <DocumentsPreview />
                )}

                {activePreviewTab === "network" && (
                  <NetworkPreview />
                )}
              </div>

            </div>

            {/* FLOATING WARRANTY CARD */}

            <div className="absolute -right-3 top-[23%] hidden w-[180px] rounded-2xl border border-white/15 bg-[#172838]/95 p-4 shadow-2xl backdrop-blur-xl xl:block">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#718d4f]/10 text-[#8ca667]">
                  <ShieldCheck size={15} />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.1em] text-white/30">
                    Warranty
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-white">
                    Coverage tracked
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[10px] leading-5 text-white/40">
                LG UltraWide Monitor
              </p>
            </div>

            {/* FLOATING RECEIPT CARD */}

            <div className="absolute -bottom-7 -left-4 hidden w-[205px] rounded-2xl border border-white/15 bg-[#172838]/95 p-4 shadow-2xl backdrop-blur-xl md:block">
              <div className="flex items-center gap-2">
                <Receipt
                  size={15}
                  className="text-[#8ca667]"
                />

                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/35">
                  Purchase record
                </p>
              </div>

              <p className="mt-3 font-serif text-base text-[#f4f0e8]">
                Best Buy Receipt
              </p>

              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#8ca667]">
                <CheckCircle2 size={12} />

                Saved to device
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY STRIP */}

      <section className="border-y border-white/15 bg-[#192b3e]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-2 px-5 py-5 md:px-8">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <a
                key={category.label}
                href={
                  category.label ===
                  "Smart Import"
                    ? "#smart-import-demo"
                    : category.label ===
                        "Network"
                      ? "#network"
                      : category.label ===
                          "Maintenance"
                        ? "#maintenance"
                        : "#vault-overview"
                }
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#d0d6db] transition hover:border-[#8ca667] hover:text-white"
              >
                <Icon
                  size={12}
                  className="text-[#809d5d]"
                />

                {category.label}
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}

function MiniNavItem({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        active
          ? "cursor-pointer border-b border-[#718d4f] pb-1 text-[10px] font-semibold text-[#e7ecef] transition-colors"
          : "cursor-pointer pb-1 text-[10px] font-medium text-white/30 transition-colors hover:text-white/75"
      }
    >
      {label}
    </button>
  );
}

function OverviewPreview() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard value="18" label="Devices" />
        <MetricCard value="34" label="Documents" />
        <MetricCard value="7" label="Warranties" />
        <MetricCard value="4" label="Maintenance" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1926]">
          <PreviewHeader
            eyebrow="Recently organized"
            title="Your latest device records"
            icon={<Laptop size={16} />}
          />

          <div className="space-y-px bg-white/10">
            <DeviceRow
              name='LG 34" UltraWide Monitor'
              location="Office"
              detail="Warranty tracked"
            />

            <DeviceRow
              name="Apple TV 4K"
              location="Living Room"
              detail="Receipt saved"
            />

            <DeviceRow
              name="Eero Pro 6E"
              location="Network"
              detail="Manual attached"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1926] p-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/30">
            Vault status
          </p>

          <div className="mt-4 flex items-end gap-2">
            <span className="font-serif text-4xl text-[#f4f0e8]">
              92
            </span>

            <span className="pb-1 text-xs text-white/30">
              / 100
            </span>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[92%] rounded-full bg-[#718d4f]" />
          </div>

          <div className="mt-5 space-y-3">
            <StatusLine
              text="Receipts organized"
              complete
            />
            <StatusLine
              text="Warranties tracked"
              complete
            />
            <StatusLine text="1 item needs attention" />
          </div>
        </div>
      </div>

      <SmartImportStrip />
    </>
  );
}

function DevicesPreview() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard value="18" label="Devices" />
        <MetricCard value="15" label="Online" />
        <MetricCard value="7" label="Protected" />
        <MetricCard value="6" label="Rooms" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1926]">
        <PreviewHeader
          eyebrow="Device inventory"
          title="Technology across your home"
          icon={<Laptop size={16} />}
        />

        <div className="space-y-px bg-white/10">
          <DeviceRow
            name='LG 34" UltraWide Monitor'
            location="Office"
            detail="Online · Warranty active"
          />

          <DeviceRow
            name="Apple TV 4K"
            location="Living Room"
            detail="Online · Receipt saved"
          />

          <DeviceRow
            name="Samsung OLED TV"
            location="Family Room"
            detail="Online · Manual attached"
          />

          <DeviceRow
            name="Sonos Arc"
            location="Living Room"
            detail="Online · Protected"
          />
        </div>
      </div>
    </>
  );
}

function DocumentsPreview() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard value="34" label="Documents" />
        <MetricCard value="11" label="Receipts" />
        <MetricCard value="9" label="Manuals" />
        <MetricCard value="7" label="Warranties" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1926]">
        <PreviewHeader
          eyebrow="Document vault"
          title="Records connected to your devices"
          icon={<FileText size={16} />}
        />

        <div className="space-y-px bg-white/10">
          <DocumentRow
            icon={<Receipt size={14} />}
            title="Best Buy Purchase Receipt"
            meta='LG 34" UltraWide Monitor · May 8, 2026'
          />

          <DocumentRow
            icon={<FileText size={14} />}
            title="Owner's Manual"
            meta="Eero Pro 6E · PDF"
          />

          <DocumentRow
            icon={<ShieldCheck size={14} />}
            title="Extended Warranty"
            meta="Samsung OLED TV · Active"
          />

          <DocumentRow
            icon={<Receipt size={14} />}
            title="Apple Store Receipt"
            meta="Apple TV 4K · Saved"
          />
        </div>
      </div>
    </>
  );
}

function NetworkPreview() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard value="18" label="Connected" />
        <MetricCard value="15" label="Online" />
        <MetricCard value="3" label="Offline" />
        <MetricCard value="1" label="Gateway" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-2xl border border-white/10 bg-[#0d1926] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#718d4f]/10 text-[#8ca667]">
              <Router size={17} />
            </div>

            <div>
              <p className="text-xs font-semibold text-[#e4e9ec]">
                Eero Pro 6E
              </p>

              <p className="mt-1 text-[9px] text-white/30">
                Main Gateway · Online
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <StatusLine
              text="Internet connection healthy"
              complete
            />
            <StatusLine
              text="15 devices currently online"
              complete
            />
            <StatusLine
              text="3 devices have not checked in recently"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1926] p-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/30">
            Network health
          </p>

          <div className="mt-5 flex items-center gap-3">
            <Wifi
              size={22}
              className="text-[#8ca667]"
            />

            <div>
              <p className="font-serif text-2xl text-[#f4f0e8]">
                Good
              </p>

              <p className="mt-1 text-[9px] text-white/30">
                Home network looks healthy
              </p>
            </div>
          </div>

          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[88%] rounded-full bg-[#718d4f]" />
          </div>
        </div>
      </div>
    </>
  );
}

function PreviewHeader({
  eyebrow,
  title,
  icon,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/30">
          {eyebrow}
        </p>

        <p className="mt-1 text-xs font-semibold text-[#e4e9ec]">
          {title}
        </p>
      </div>

      <div className="text-[#789557]">
        {icon}
      </div>
    </div>
  );
}

function DocumentRow({
  icon,
  title,
  meta,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-[#101d2b] px-4 py-3.5 transition-colors hover:bg-[#15283a]">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#718d4f]/10 text-[#8ca667]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold text-[#e6ebee]">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[9px] text-white/30">
          {meta}
        </p>
      </div>
    </div>
  );
}

function SmartImportStrip() {
  return (
    <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#718d4f]/20 bg-[#718d4f]/8 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#718d4f]/25 bg-[#718d4f]/10 text-[#8ca667]">
          <Sparkles size={16} />
        </div>

        <div>
          <p className="text-xs font-semibold text-[#e4e9ec]">
            Smart Import™ ready
          </p>

          <p className="mt-1 text-[10px] text-white/35">
            Forward a receipt. We&apos;ll prepare the record.
          </p>
        </div>
      </div>

      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8ca667]">
        Ready to use
      </span>
    </div>
  );
}

function MetricCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1926] px-3 py-3.5">
      <p className="font-serif text-xl text-[#f4f0e8]">
        {value}
      </p>

      <p className="mt-1 text-[9px] uppercase tracking-[0.08em] text-white/30">
        {label}
      </p>
    </div>
  );
}

function DeviceRow({
  name,
  location,
  detail,
}: {
  name: string;
  location: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-[#101d2b] px-4 py-3.5 transition-colors hover:bg-[#15283a]">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#718d4f]/10 text-[#8ca667]">
        <Laptop size={14} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold text-[#e6ebee]">
          {name}
        </p>

        <p className="mt-0.5 truncate text-[9px] text-white/30">
          {location} · {detail}
        </p>
      </div>
    </div>
  );
}

function StatusLine({
  text,
  complete = false,
}: {
  text: string;
  complete?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={
          complete
            ? "h-1.5 w-1.5 rounded-full bg-[#718d4f]"
            : "h-1.5 w-1.5 rounded-full bg-[#b49b5c]"
        }
      />

      <span className="text-[10px] text-white/45">
        {text}
      </span>
    </div>
  );
}