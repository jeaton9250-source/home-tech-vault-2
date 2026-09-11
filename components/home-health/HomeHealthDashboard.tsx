"use client";

import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";

import { useClientVaultMode } from "@/hooks/useClientVaultMode";
import type { HomeHealthResult } from "@/lib/home-health/types";
import type { HomeReadinessResult } from "@/lib/home-health";

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
  homeReadiness: HomeReadinessResult | null;
  overviewStats: OverviewStats;
  hasHousehold: boolean;
  canCreate: boolean;
};

function formatRecommendationTitle(title: string) {
  return title.replace(/\bTv\b/g, "TV");
}

export default function HomeHealthDashboard({
  firstName,
  homeHealth,
  homeReadiness,
  overviewStats,
  canCreate,
}: Props) {
  const { active: isClientVaultMode } = useClientVaultMode();

  const attentionItems = homeHealth.highlights.filter(
    (item) => item.tone === "warning",
  );

  const attentionCount = attentionItems.length;

  const displayName = firstName?.trim() || "Your";

  const readinessScore = homeReadiness?.score ?? homeHealth.score ?? 0;

  const readinessMessage =
    homeReadiness?.rememberedLabel ??
    "Your home record gets stronger as you add useful details.";

  const readinessActions = homeReadiness?.actions ?? [];

  const subscriptionSpend = homeHealth.monthlySubscriptionSpend.toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
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
                <span className="block text-[#8ea864]">all in one place.</span>
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#b9c3c9]">
                Everything you need to know about your home, ready when you need
                it.
              </p>
            </div>

            <div className="min-w-[250px] border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <div className="flex items-end justify-between gap-8">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#899aa7]">
                    Home Readiness
                  </p>

                  <p className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-white">
                    {readinessScore}%
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#899aa7]">
                    Home Pulse
                  </p>

                  <p className="mt-2 text-lg font-medium text-[#f7f4ed]">
                    {attentionCount === 0
                      ? "All clear"
                      : `${attentionCount} ${
                          attentionCount === 1 ? "item" : "items"
                        }`}
                  </p>
                </div>
              </div>

              {homeReadiness ? (
                <p className="mt-5 max-w-[280px] text-xs leading-5 text-[#9caab4]">
                  {readinessMessage}
                </p>
              ) : null}

              <Link
                href="/insights"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#a9c584] transition hover:text-[#c1daa4]"
              >
                Open Home Pulse
                <ArrowRight size={15} aria-hidden />
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

      {/* NEXT BEST READINESS ACTIONS */}
      {readinessActions.length > 0 ? (
        <section className="mt-7 overflow-hidden rounded-[28px] bg-[#fbf8f2] shadow-[0_18px_45px_-38px_rgba(15,25,35,0.3)] ring-1 ring-[#17212a]/[0.05]">
          <div className="border-b border-[#17212a]/[0.07] px-6 py-6 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78905b]">
                  Home Readiness
                </p>

                <h2 className="mt-2 font-serif text-[28px] font-medium tracking-[-0.04em] text-[#17212a] sm:text-[32px]">
                  Remember more of your home.
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#748087]">
                  Small details make your Vault more useful over time. Start
                  with the highest-value gaps.
                </p>
              </div>

              {homeReadiness ? (
                <div className="shrink-0 rounded-full bg-[#617c43]/10 px-4 py-2 text-xs font-semibold text-[#617c43]">
                  {homeReadiness.completedItems} of{" "}
                  {homeReadiness.possibleItems} details remembered
                </div>
              ) : null}
            </div>
          </div>

          <div className="divide-y divide-[#17212a]/[0.06]">
            {readinessActions.slice(0, 4).map((action, index) => {
              const actionHref = canCreate
                ? action.href
                : `/devices/${action.deviceId}`;

              return (
                <div
                  key={action.id}
                  className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#183047]/[0.06] text-xs font-semibold text-[#617c43]">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[#17212a]">
                        {action.title}
                      </h3>

                      <p className="mt-1 max-w-2xl text-xs leading-5 text-[#7a858b]">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={actionHref}
                    className="inline-flex shrink-0 items-center gap-2 self-start text-xs font-semibold text-[#617c43] transition hover:text-[#4f6936] sm:self-auto"
                  >
                    {canCreate ? "Improve" : "Review"}

                    <ArrowRight size={13} aria-hidden />
                  </Link>
                </div>
              );
            })}
          </div>

          {readinessActions.length > 4 ? (
            <div className="border-t border-[#17212a]/[0.06] px-6 py-4 text-center sm:px-7">
              <Link
                href="/home"
                className="text-xs font-semibold text-[#617c43] transition hover:text-[#4f6936]"
              >
                Review your home record
              </Link>
            </div>
          ) : null}
        </section>
      ) : homeReadiness && homeReadiness.deviceCount > 0 ? (
        <section className="mt-7 rounded-[28px] bg-[#eef3e8] px-6 py-6 ring-1 ring-[#617c43]/10 sm:px-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#617c43]">
            Home Readiness
          </p>

          <h2 className="mt-2 font-serif text-[28px] font-medium tracking-[-0.04em] text-[#17212a]">
            Your core home record is complete.
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#65716f]">
            Home Tech Vault has the key details it checks for across your
            documented devices.
          </p>
        </section>
      ) : null}

      {/* NEXT BEST ACTION */}
      {homeHealth.recommendation ? (
        <section className="mt-7 rounded-[28px] bg-[#fbf8f2] px-6 py-6 shadow-[0_18px_45px_-38px_rgba(15,25,35,0.3)] ring-1 ring-[#17212a]/[0.05] sm:px-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#617c43]/10 text-[#617c43]">
                <Sparkles size={17} aria-hidden />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78905b]">
                  Worth your attention
                </p>

                <h2 className="mt-2 font-serif text-[26px] font-medium tracking-[-0.035em] text-[#17212a] sm:text-[30px]">
                  {formatRecommendationTitle(homeHealth.recommendation.title)}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#748087]">
                  {homeHealth.recommendation.description}
                </p>
              </div>
            </div>

            <Link
              href={homeHealth.recommendation.href}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#17212a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#243442]"
            >
              Review
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </section>
      ) : null}

      {/* ASK YOUR VAULT */}
      {!isClientVaultMode ? (
        <section className="mt-7 rounded-[28px] bg-[#fbf8f2] px-6 py-7 shadow-[0_18px_45px_-38px_rgba(15,25,35,0.3)] ring-1 ring-[#17212a]/[0.05] sm:px-7">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78905b]">
                Ask Your Vault
              </p>

              <h2 className="mt-3 max-w-md font-serif text-[32px] font-medium leading-tight tracking-[-0.04em] text-[#17212a] sm:text-[36px]">
                Your home has answers.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-[#748087]">
                Find a receipt, check a warranty, look up a device, or ask what
                needs attention.
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
                placeholder="Ask Your Vault anything…"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-[#17212a] outline-none placeholder:text-[#929a9e]"
              />

              <button
                type="submit"
                aria-label="Ask Your Vault"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#183047] text-white transition hover:bg-[#243f58]"
              >
                <ArrowRight size={15} aria-hidden />
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
    <Link href={href} className="group inline-flex items-baseline gap-1.5">
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
  return <span className="h-1 w-1 rounded-full bg-white/20" aria-hidden />;
}
