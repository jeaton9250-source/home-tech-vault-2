"use client";

import {
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  formatDisplayDate,
} from "@/lib/home-health/greeting";

import { usePermissions } from "@/hooks/usePermissions";
import { MORGAN_HOUSEHOLD } from "@/lib/demo/morganHousehold";
import { humanizeAdvisorText } from "@/lib/advisor/presentation";
import CircularProgressRing from "@/components/ui/CircularProgressRing";

type DashboardHeroProps = {
  firstName: string;
  score: number | null;
  healthSummary?: string | null;
};

export default function DashboardHero({
  firstName,
  score,
  healthSummary,
}: DashboardHeroProps) {
  const { isDemo } = usePermissions();

  const summary =
    healthSummary?.trim() ||
    (score !== null
      ? "Your home technology is organized and ready. Important information is easy to find when you need it."
      : "Add your first device to begin building your Home Tech Vault.");


  return (
    <section
      className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#183047] px-6 py-7 text-[#f5f1e8] shadow-[0_30px_75px_-42px_rgba(0,0,0,0.7)] sm:px-8 sm:py-8 lg:px-10 lg:py-9"
      data-tour="home-pulse"
    >
      {/* AMBIENT BACKGROUND */}

      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#718d4f]/10 blur-[90px]" />

      <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#718d4f]/5 blur-[100px]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
        {/* COPY */}

        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/45">
              <Sparkles
                size={12}
                className="text-[#718d4f]"
              />

              {formatDisplayDate()}
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-[#718d4f]/25 bg-[#718d4f]/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#718d4f]">
              <ShieldCheck
                size={12}
              />

              Home Pulse
            </span>
          </div>


          <h1 className="mt-4 max-w-2xl font-serif text-3xl font-medium leading-[1.03] tracking-[-0.045em] text-[#f5f1e8] sm:text-4xl lg:text-[2.8rem]">
            {firstName}&apos;s home,
            <br />

            <span className="text-[#718d4f]">
              at a glance.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#aeb8c1] sm:text-base">
            {humanizeAdvisorText(summary)}
          </p>

          <div className="mt-6 flex items-center gap-2 text-xs font-medium text-[#91aa72]">
            <ShieldCheck
              size={15}
              aria-hidden
            />

            <span>
              Important details are organized and ready when you need them.
            </span>
          </div>
        </div>

        {/* SCORE */}

        <div className="shrink-0">
          {score !== null ? (
            <div className="relative rounded-[26px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-sm">
              <p className="mb-4 text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
                Vault Readiness
              </p>

              <CircularProgressRing
                value={score}
                size={122}
                strokeWidth={8}
                progressColor="#718d4f"
                ariaLabel={`Home Health Score: ${score}%`}
              >
                <div className="text-center">
                  <span className="font-serif text-3xl font-medium tracking-[-0.045em] text-[#f5f1e8]">
                    {score}%
                  </span>

                  <span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.13em] text-white/30">
                    Organized
                  </span>
                </div>
              </CircularProgressRing>

              <div className="mt-4 border-t border-white/10 pt-4 text-center">
                <p className="text-[10px] leading-5 text-white/35">
                  Overall home technology readiness
                </p>
              </div>
            </div>
          ) : (
            <div className="min-w-[180px] rounded-[24px] border border-white/10 bg-white/[0.045] px-6 py-6 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-[#718d4f]/25 bg-[#718d4f]/10 text-[#718d4f]">
                <Sparkles size={16} />
              </div>

              <p className="mt-4 font-serif text-lg text-[#f5f1e8]">
                Getting Started
              </p>

              <p className="mt-2 text-xs text-white/35">
                Add your first device
              </p>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM STATUS STRIP */}

      <div className="relative mt-8 grid border-t border-white/10 pt-5 sm:grid-cols-3">
        <HeroStatus
          label="Devices"
          value="Organized"
        />

        <HeroStatus
          label="Records"
          value="Available"
        />

        <HeroStatus
          label="Home Pulse"
          value="Ready"
          last
        />
      </div>
    </section>
  );
}

function HeroStatus({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`py-3 sm:px-5 sm:py-0 ${
        last
          ? ""
          : "border-b border-white/10 sm:border-b-0 sm:border-r"
      }`}
    >
      <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/25">
        {label}
      </p>

      <div className="mt-1.5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#718d4f]" />

        <p className="text-xs font-medium text-[#dfe5e8]">
          {value}
        </p>
      </div>
    </div>
  );
}
