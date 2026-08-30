"use client";

import Link from "next/link";
import {
  ArrowRight,
  Search,
  Sparkles,
} from "lucide-react";

import { useClientVaultMode } from "@/hooks/useClientVaultMode";
import type { HomeHealthResult } from "@/lib/home-health/types";

type OverviewStats = {
  deviceCount: number;
  onlineDeviceCount: number;
  offlineDeviceCount: number;
  documentCount: number;
  activeWarrantyCount: number;
  familyMemberCount: number;
};

type Props = {
  firstName: string | null;
  homeHealth: HomeHealthResult;
  overviewStats: OverviewStats;
  hasHousehold: boolean;
};

function formatRecommendationTitle(
  title: string
) {
  return title.replace(
    /\bTv\b/g,
    "TV"
  );
}

export default function HomeHealthDashboard({
  firstName,
  homeHealth,
  overviewStats,
}: Props) {
  const {
    active: isClientVaultMode,
  } = useClientVaultMode();

  const attentionItems =
    homeHealth.highlights.filter(
      (item) => item.tone === "warning"
    );

  const attentionCount =
    attentionItems.length;

  const displayName =
    firstName?.trim() || "Your";

  const subscriptionSpend =
    homeHealth.monthlySubscriptionSpend.toLocaleString(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    );

  return (
    <div className="mx-auto w-full max-w-[1120px] pt-5 pb-14">
      {/* PRIMARY HOME OVERVIEW */}
      <section className="overflow-hidden rounded-[32px] bg-[#183047] text-[#f7f4ed] shadow-[0_28px_70px_-45px_rgba(14,30,44,0.72)]">
        <div className="px-6 py-7 sm:px-10 sm:py-8 lg:px-12 lg:py-9">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9eb77f]">
                Home
              </p>

              <h1 className="mt-4 max-w-xl font-serif text-[42px] font-medium leading-[0.98] tracking-[-0.045em] text-[#f7f4ed] sm:text-[54px]">
                {displayName}
                {firstName ? "’s" : ""} home,
                <span className="block text-[#8ea864]">
                  all in one place.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#b9c3c9]">
                Everything you need to know about your home,
                ready when you need it.
              </p>
            </div>

            <div className="min-w-[250px] border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <div className="flex items-end justify-between gap-8">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#899aa7]">
                    Organized
                  </p>

                  <p className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-white">
                    {homeHealth.score}%
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#899aa7]">
                    Attention
                  </p>

                  <p className="mt-2 text-lg font-medium text-[#f7f4ed]">
                    {attentionCount === 0
                      ? "All clear"
                      : `${attentionCount} ${
                          attentionCount === 1
                            ? "item"
                            : "items"
                        }`}
                  </p>
                </div>
              </div>

              <Link
                href="/insights"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#a9c584] transition hover:text-[#c1daa4]"
              >
                Review home health
                <ArrowRight
                  size={15}
                  aria-hidden
                />
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <HeroStat
                href="/devices"
                value={overviewStats.deviceCount}
                label="Devices"
              />

              <HeroDot />

              <HeroStat
                href="/documents"
                value={overviewStats.documentCount}
                label="Documents"
              />

              <HeroDot />

              <HeroStat
                href="/warranties"
                value={overviewStats.activeWarrantyCount}
                label="Warranties"
              />

              <HeroDot />

              <HeroStat
                href="/subscriptions"
                value={`${subscriptionSpend}/mo`}
                label="Subscriptions"
              />
            </div>
          </div>
        </div>
      </section>

      {/* NEXT BEST ACTION */}
      {homeHealth.recommendation ? (
        <section className="mt-7 rounded-[28px] bg-[#fbf8f2] px-6 py-6 shadow-[0_18px_45px_-38px_rgba(15,25,35,0.3)] ring-1 ring-[#17212a]/[0.05] sm:px-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#617c43]/10 text-[#617c43]">
                <Sparkles
                  size={17}
                  aria-hidden
                />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78905b]">
                  Up next
                </p>

                <h2 className="mt-2 font-serif text-[26px] font-medium tracking-[-0.035em] text-[#17212a] sm:text-[30px]">
                  {formatRecommendationTitle(
                    homeHealth
                      .recommendation
                      .title
                  )}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#748087]">
                  {
                    homeHealth
                      .recommendation
                      .description
                  }
                </p>
              </div>
            </div>

            <Link
              href={
                homeHealth.recommendation
                  .href
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#17212a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#243442]"
            >
              Take action
              <ArrowRight
                size={14}
                aria-hidden
              />
            </Link>
          </div>
        </section>
      ) : null}

      {/* ASK YOUR HOME */}
      {!isClientVaultMode ? (
        <section className="mt-7 rounded-[28px] bg-[#fbf8f2] px-6 py-7 shadow-[0_18px_45px_-38px_rgba(15,25,35,0.3)] ring-1 ring-[#17212a]/[0.05] sm:px-7">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78905b]">
                Ask your home
              </p>

              <h2 className="mt-3 max-w-md font-serif text-[32px] font-medium leading-tight tracking-[-0.04em] text-[#17212a] sm:text-[36px]">
                Ask your home.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-[#748087]">
                Find a receipt, check a warranty,
                look up a device, or ask what needs attention.
              </p>
            </div>

            <form
              action="/smart-search"
              method="get"
              className="flex min-h-[68px] items-center gap-4 rounded-[22px] bg-[#f5f2eb] px-5 shadow-[0_18px_55px_-40px_rgba(15,25,35,0.3)] ring-1 ring-[#17212a]/[0.055] transition focus-within:ring-[#617c43]/30 sm:px-6"
            >
              <Search
                size={20}
                className="shrink-0 text-[#829078]"
                aria-hidden
              />

              <input
                type="search"
                name="q"
                required
                autoComplete="off"
                placeholder="Ask something about your home…"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-[#17212a] outline-none placeholder:text-[#929a9e]"
              />

              <button
                type="submit"
                aria-label="Search your home"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#183047] text-white transition hover:bg-[#243f58]"
              >
                <ArrowRight
                  size={15}
                  aria-hidden
                />
              </button>
            </form>
          </div>
        </section>
      ) : null}

    </div>
  );
}

function HeroStat({
  href,
  value,
  label,
}: {
  href: string;
  value: string | number;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-baseline gap-1.5"
    >
      <span className="text-sm font-semibold text-[#f7f4ed] transition group-hover:text-[#b6cf96]">
        {value}
      </span>

      <span className="text-[11px] text-[#899aa7] transition group-hover:text-[#aab7bf]">
        {label}
      </span>
    </Link>
  );
}

function HeroDot() {
  return (
    <span
      className="h-1 w-1 rounded-full bg-white/20"
      aria-hidden
    />
  );
}
