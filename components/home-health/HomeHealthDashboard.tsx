"use client";

import {
  FileText,
  House,
  ShieldCheck,
  UsersRound,
  Wifi,
} from "lucide-react";

import DashboardHero from "@/components/dashboard/DashboardHero";
import DashboardUnlockGate from "@/components/dashboard/DashboardUnlockGate";
import HomeAdvisorPreview from "@/components/advisor/HomeAdvisorPreview";
import RecommendedNextStep from "@/components/dashboard/RecommendedNextStep";
import SmartSearch from "@/components/search/SmartSearch";
import HomeHealthEmptyState from "@/components/home-health/HomeHealthEmptyState";
import { useHomeAdvisor } from "@/hooks/useHomeAdvisor";
import { usePermissions } from "@/hooks/usePermissions";
import { getHomeHealthDisplayMessage } from "@/lib/home-health/display";

import type { DashboardOverviewStats } from "@/lib/dashboard/types";
import type { HomeHealthResult } from "@/lib/home-health/types";

type HomeHealthDashboardProps = {
  firstName: string;
  homeHealth: HomeHealthResult;
  overviewStats: DashboardOverviewStats;
};

export default function HomeHealthDashboard({
  firstName,
  homeHealth,
  overviewStats,
}: HomeHealthDashboardProps) {
  const {
    isDemo,
    role,
    canCreate,
  } = usePermissions();

  const {
    advisor,
    loading: advisorLoading,
    error: advisorError,
  } = useHomeAdvisor();

  const shouldLockDashboard =
    !isDemo &&
    canCreate &&
    role !== "viewer" &&
    overviewStats.deviceCount < 3;

  if (shouldLockDashboard) {
    return (
      <DashboardUnlockGate
        firstName={firstName}
        deviceCount={
          overviewStats.deviceCount
        }
      />
    );
  }

  const healthSummary =
    advisor?.summary ||
    (homeHealth.status
      ? getHomeHealthDisplayMessage(
          homeHealth.status
        )
      : null);

  return (
    <div className="mx-auto w-full max-w-[1240px] pb-14">
      {/* PAGE INTRO */}

      <section className="mb-5 flex flex-col gap-4 px-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-7 bg-[#617c43]" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#617c43]">
              Home Overview
            </p>
          </div>

          <h1 className="mt-3 font-serif text-3xl font-medium tracking-[-0.04em] text-[#101a22] sm:text-4xl">
            Welcome home, {firstName}.
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68737b] sm:text-base">
            Your devices, records, warranties,
            network details, and household
            information — organized in one place.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-[#617c43]/20 bg-[#617c43]/8 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#617c43] text-white">
            <ShieldCheck
              size={17}
              aria-hidden
            />
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#78836f]">
              Vault Readiness
            </p>

            <p className="mt-0.5 text-sm font-semibold text-[#17212a]">
              {homeHealth.score}% ready
            </p>
          </div>
        </div>
      </section>

      {/* HERO */}

      <DashboardHero
        firstName={firstName}
        score={homeHealth.score}
        healthSummary={healthSummary}
      />

      {/* OVERVIEW METRICS */}

      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={Wifi}
          label="Devices"
          value={overviewStats.deviceCount}
          detail={`${overviewStats.onlineDeviceCount} online`}
        />

        <StatCard
          icon={ShieldCheck}
          label="Active Warranties"
          value={
            overviewStats.activeWarrantyCount
          }
          detail="Coverage tracked"
        />

        <StatCard
          icon={FileText}
          label="Documents"
          value={overviewStats.documentCount}
          detail="Stored in your Vault"
        />

        <StatCard
          icon={UsersRound}
          label="Household"
          value={
            overviewStats.familyMemberCount
          }
          detail="Members"
        />

        <StatCard
          icon={House}
          label="Offline Devices"
          value={
            overviewStats.offlineDeviceCount
          }
          detail={
            overviewStats.offlineDeviceCount ===
            0
              ? "Everything looks connected"
              : "Worth reviewing"
          }
          attention={
            overviewStats.offlineDeviceCount > 0
          }
        />
      </section>

      {/* MAIN DASHBOARD */}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        {/* LEFT */}

        <div className="space-y-6">
          <SectionShell
            eyebrow="Home Advisor"
            title="What deserves your attention"
          >
            <HomeAdvisorPreview
              advisor={advisor}
              loading={advisorLoading}
              error={advisorError}
            />
          </SectionShell>

          <SectionShell
            eyebrow="Next Step"
            title="Keep your Vault moving forward"
          >
            {homeHealth.isEmpty ? (
              <HomeHealthEmptyState
                recommendation={
                  homeHealth.recommendation
                }
              />
            ) : (
              <RecommendedNextStep
                recommendation={
                  homeHealth.recommendation
                }
              />
            )}
          </SectionShell>
        </div>

        {/* RIGHT */}

        <div className="space-y-6">
          {/* SEARCH */}

          <section className="relative overflow-hidden rounded-[26px] border border-[#182533]/10 bg-[#101d2b] p-6 text-[#f4f0e8] shadow-[0_24px_55px_-40px_rgba(0,0,0,0.7)]">
            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#718d4f]/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="h-px w-6 bg-[#718d4f]" />

                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8ca667]">
                  Ask Your Vault
                </p>
              </div>

              <h2 className="mt-3 font-serif text-2xl font-medium tracking-[-0.03em] text-[#f4f0e8]">
                Find anything in your home.
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#aab4bc]">
                Search your devices, warranties,
                documents, and household information
                from one place.
              </p>

              <div className="mt-5">
                <SmartSearch
                  mode="dashboard"
                  variant="hero"
                />
              </div>
            </div>
          </section>

          {/* VAULT GROWTH */}

          <section className="rounded-[26px] border border-[#182533]/10 bg-[#f8f5ef] p-6 shadow-[0_18px_45px_-36px_rgba(15,25,35,0.45)]">
            <div className="flex items-center gap-3">
              <span className="h-px w-6 bg-[#617c43]" />

              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
                Your Home Tech Vault
              </p>
            </div>

            <h2 className="mt-3 max-w-md font-serif text-2xl font-medium leading-tight tracking-[-0.03em] text-[#17212a]">
              Your Vault becomes more useful as
              it grows.
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#68737b]">
              Add devices, receipts, warranties,
              manuals, and maintenance information
              over time. The more complete your Vault
              becomes, the easier it is to understand
              what you own and what may need attention.
            </p>

            <div className="mt-5 space-y-2.5">
              <InsightRow text="Keep important devices documented" />

              <InsightRow text="Attach receipts and manuals" />

              <InsightRow text="Track warranty coverage" />

              <InsightRow text="Share useful information with your household" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean;
  }>;
  label: string;
  value: number;
  detail: string;
  attention?: boolean;
};

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  attention = false,
}: StatCardProps) {
  return (
    <div className="group rounded-[22px] border border-[#182533]/10 bg-[#f8f5ef] p-4 shadow-[0_16px_40px_-34px_rgba(15,25,35,0.45)] transition hover:-translate-y-0.5 hover:border-[#617c43]/20">
      <div className="flex items-center justify-between gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            attention
              ? "bg-[#b58a42]/10 text-[#9a7336]"
              : "bg-[#617c43]/10 text-[#617c43]"
          }`}
        >
          <Icon
            size={17}
            aria-hidden
          />
        </div>

        <span
          className={`font-serif text-2xl font-medium tracking-[-0.04em] ${
            attention
              ? "text-[#9a7336]"
              : "text-[#17212a]"
          }`}
        >
          {value}
        </span>
      </div>

      <p className="mt-4 text-xs font-semibold text-[#17212a]">
        {label}
      </p>

      <p className="mt-1 text-[10px] leading-4 text-[#7a858d]">
        {detail}
      </p>
    </div>
  );
}

function SectionShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-[#182533]/10 bg-[#f8f5ef] p-5 shadow-[0_18px_45px_-36px_rgba(15,25,35,0.45)] sm:p-6">
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <span className="h-px w-6 bg-[#617c43]" />

          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
            {eyebrow}
          </p>
        </div>

        <h2 className="mt-3 font-serif text-xl font-medium tracking-[-0.03em] text-[#17212a] sm:text-2xl">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

function InsightRow({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#182533]/8 bg-[#eee9df]/55 px-3.5 py-3">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#617c43]/10">
        <div className="h-1.5 w-1.5 rounded-full bg-[#617c43]" />
      </div>

      <span className="text-xs font-medium text-[#56616a]">
        {text}
      </span>
    </div>
  );
}