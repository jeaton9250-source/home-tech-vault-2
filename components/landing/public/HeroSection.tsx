"use client";

import Link from "next/link";

import {
  ArrowRight,
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

          <div className="absolute right-[-240px] top-[-100px] h-[700px] w-[700px] rounded-full bg-[#5c4058]/10 blur-[120px]" />

          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "70px 70px",
            }}
          />
        </div>

        <div className="relative mx-auto grid min-h-[690px] max-w-[1240px] items-center gap-14 px-5 py-20 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-24">
          {/* LEFT */}

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/[0.03] px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7d9c54]" />

              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8ca667]">
                Home technology, archived
              </span>
            </div>

            <h1 className="mt-8 max-w-[670px] font-serif text-[3.35rem] font-medium leading-[0.98] tracking-[-0.055em] text-[#f4f0e8] sm:text-[4.4rem] lg:text-[5.15rem]">
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
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-white/65 bg-white/[0.02] px-7 text-sm font-semibold text-[#f4f0e8] transition hover:bg-white/10"
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

          {/* RIGHT EDITORIAL VISUAL */}

          <div className="relative lg:pt-14">
            <div className="relative overflow-hidden rounded-[26px] border border-white/15 bg-[#182533] shadow-[0_35px_80px_-30px_rgba(0,0,0,0.65)]">
              {/* FAUX HOME SCENE */}

              <div className="relative h-[410px] overflow-hidden sm:h-[470px]">
                {/* WALL */}

                <div className="absolute inset-0 bg-[linear-gradient(135deg,#c8b89a_0%,#a99073_43%,#596253_43%,#4a584c_100%)]" />

                {/* WINDOW */}

                <div className="absolute left-[7%] top-[8%] h-[54%] w-[30%] rounded-sm border-[10px] border-[#dfd6c4] bg-[linear-gradient(150deg,#dbe6e7,#9ab0a6)] shadow-xl">
                  <div className="absolute inset-y-0 left-1/2 w-[4px] bg-[#dfd6c4]" />
                  <div className="absolute left-0 top-1/2 h-[4px] w-full bg-[#dfd6c4]" />
                </div>

                {/* DESK */}

                <div className="absolute bottom-[8%] left-[6%] right-[5%] h-[32%] origin-left -skew-y-[2deg] rounded-lg bg-[#725a3d] shadow-2xl">
                  <div className="absolute inset-x-0 top-0 h-[8px] bg-[#927654]" />
                </div>

                {/* ROUTER */}

                <div className="absolute bottom-[25%] left-[37%] h-[55px] w-[115px] rounded-lg border border-white/10 bg-[#333936] shadow-xl">
                  <div className="absolute left-4 top-4 flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#7c9958]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#7c9958]/70" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  </div>
                </div>

                {/* LAPTOP / TABLET */}

                <div className="absolute bottom-[17%] right-[11%] h-[95px] w-[130px] rotate-[5deg] rounded-lg border border-white/10 bg-[#1c2630] shadow-xl">
                  <div className="absolute inset-[7px] rounded bg-[#314153]" />
                </div>

                {/* PHONE */}

                <div className="absolute bottom-[15%] left-[21%] h-[78px] w-[42px] -rotate-[8deg] rounded-[8px] border border-white/20 bg-[#eee9df] shadow-xl" />

                {/* LAMP */}

                <div className="absolute right-[12%] top-[9%] h-[185px] w-[85px]">
                  <div className="absolute left-1/2 top-[52px] h-[115px] w-[4px] -translate-x-1/2 bg-[#ae8a4f]" />

                  <div className="absolute left-1/2 top-0 h-[65px] w-[90px] -translate-x-1/2 rounded-t-[50%] rounded-b-lg bg-[#d8c8a9]" />

                  <div className="absolute bottom-0 left-1/2 h-[10px] w-[58px] -translate-x-1/2 rounded-full bg-[#ae8a4f]" />
                </div>

                {/* DARK GRADIENT */}

                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1623]/65 via-transparent to-transparent" />

                {/* LABEL */}

                <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-[#0b1623]/70 px-3 py-1.5 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
                    Sample Home
                  </p>
                </div>
              </div>
            </div>

            {/* FLOATING VAULT SUMMARY */}

            <div className="relative z-10 mx-auto -mt-9 w-[88%] rounded-2xl border border-white/35 bg-[#101d2b]/95 px-5 py-4 shadow-2xl backdrop-blur-xl sm:w-[78%]">
              <div className="grid grid-cols-4 divide-x divide-white/10">
                <VaultMetric
                  value="18"
                  label="Devices"
                />

                <VaultMetric
                  value="34"
                  label="Files"
                />

                <VaultMetric
                  value="7"
                  label="Warranties"
                />

                <VaultMetric
                  value="1"
                  label="Attention"
                  accent
                />
              </div>
            </div>

            {/* SMALL DECORATION */}

            <div className="absolute -bottom-7 -right-5 hidden rounded-2xl border border-white/15 bg-[#152330] p-4 shadow-xl sm:block">
              <div className="flex items-center gap-2">
                <Sparkles
                  size={15}
                  className="text-[#88a761]"
                />

                <span className="text-[11px] font-semibold text-[#dce2d6]">
                  Smart Import ready
                </span>
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
                    : "#vault-overview"
                }
                className="inline-flex items-center gap-2 rounded-full border border-white/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#d0d6db] transition hover:border-[#8ca667] hover:text-white"
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

function VaultMetric({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="px-2 text-center">
      <p
        className={
          accent
            ? "font-serif text-xl font-semibold text-[#89a865]"
            : "font-serif text-xl font-semibold text-[#f4f0e8]"
        }
      >
        {value}
      </p>

      <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.08em] text-white/40">
        {label}
      </p>
    </div>
  );
}