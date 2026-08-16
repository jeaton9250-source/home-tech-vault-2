"use client";

import {
  FileText,
  House,
  ShieldCheck,
  UsersRound,
  Wifi,
} from "lucide-react";

import DashboardHero from "@/components/dashboard/DashboardHero";
import HomeAdvisorPreview from "@/components/advisor/HomeAdvisorPreview";
import RecommendedNextStep from "@/components/dashboard/RecommendedNextStep";
import SmartSearch from "@/components/search/SmartSearch";
import HomeHealthEmptyState from "@/components/home-health/HomeHealthEmptyState";
import { useHomeAdvisor } from "@/hooks/useHomeAdvisor";
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
    advisor,
    loading: advisorLoading,
    error: advisorError,
  } = useHomeAdvisor();

  const healthSummary =
    advisor?.summary ||
    (homeHealth.status
      ? getHomeHealthDisplayMessage(homeHealth.status)
      : null);

  return (
    <div className="mx-auto w-full max-w-6xl pb-12">
      {/* Premium top section */}
      <section className="relative overflow-hidden rounded-[32px] border border-border-subtle/70 bg-surface-card px-5 py-6 shadow-lift sm:px-7 sm:py-8 lg:px-10 lg:py-10">
        {/* Ambient background */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-[320px] w-[320px] rounded-full bg-home-health-soft/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-[280px] w-[420px] rounded-full bg-premium-soft/25 blur-3xl" />

        <div className="relative">
          {/* Home identity */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-sunken/50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                <House
                  size={13}
                  className="text-home-health"
                  aria-hidden
                />
                Home Overview
              </div>

              <h1 className="mt-5 text-3xl font-medium tracking-[-0.045em] text-text-primary sm:text-4xl lg:text-5xl">
                Welcome home, {firstName}.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
                Your home technology, documents, warranties, and important
                details — organized in one place.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-home-health/15 bg-home-health-soft/30 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-home-health text-white">
                <ShieldCheck
                  size={19}
                  aria-hidden
                />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                  Home Pulse
                </p>

                <p className="mt-0.5 text-sm font-semibold text-text-primary">
                  {homeHealth.score}% ready
                </p>
              </div>
            </div>
          </div>

          {/* Existing hero, now nested into premium frame */}
          <div className="mt-8">
            <DashboardHero
              firstName={firstName}
              score={homeHealth.score}
              healthSummary={healthSummary}
            />
          </div>

          {/* Premium stats strip */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              icon={Wifi}
              label="Devices"
              value={overviewStats.deviceCount}
              detail={`${overviewStats.onlineDeviceCount} online`}
            />

            <StatCard
              icon={ShieldCheck}
              label="Active Warranties"
              value={overviewStats.activeWarrantyCount}
              detail="Coverage tracked"
            />

            <StatCard
              icon={FileText}
              label="Documents"
              value={overviewStats.documentCount}
              detail="Stored in your vault"
            />

            <StatCard
              icon={UsersRound}
              label="Household"
              value={overviewStats.familyMemberCount}
              detail="Members"
            />

            <StatCard
              icon={House}
              label="Offline Devices"
              value={overviewStats.offlineDeviceCount}
              detail={
                overviewStats.offlineDeviceCount === 0
                  ? "Everything looks connected"
                  : "Worth reviewing"
              }
              attention={overviewStats.offlineDeviceCount > 0}
            />
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left column */}
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
            title="Keep your home moving forward"
          >
            {homeHealth.isEmpty ? (
              <HomeHealthEmptyState
                recommendation={homeHealth.recommendation}
              />
            ) : (
              <RecommendedNextStep
                recommendation={homeHealth.recommendation}
              />
            )}
          </SectionShell>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[26px] border border-border-subtle bg-surface-card p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-home-health">
              Ask Your Vault
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight text-text-primary">
              Find anything in your home.
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Search your devices, warranties, documents, and household
              information from one place.
            </p>

            <div className="mt-5">
              <SmartSearch
                mode="dashboard"
                variant="hero"
              />
            </div>
          </section>

          <section className="rounded-[26px] border border-border-subtle bg-surface-sunken/40 p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Your Home Tech Vault
            </p>

            <h2 className="mt-2 text-lg font-semibold tracking-tight text-text-primary">
              Everything gets more useful as your vault grows.
            </h2>

            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Add devices, receipts, warranties, manuals, and maintenance
              information over time. The more complete your vault becomes, the
              easier it is to understand what you own and what may need
              attention.
            </p>

            <div className="mt-5 space-y-3">
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
    <div className="rounded-[20px] border border-border-subtle/80 bg-surface-card/80 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            attention
              ? "bg-warning-soft text-warning"
              : "bg-home-health-soft text-home-health"
          }`}
        >
          <Icon
            size={17}
            aria-hidden
          />
        </div>

        <span
          className={`text-2xl font-semibold tracking-[-0.04em] ${
            attention
              ? "text-warning"
              : "text-text-primary"
          }`}
        >
          {value}
        </span>
      </div>

      <p className="mt-4 text-xs font-semibold text-text-primary">
        {label}
      </p>

      <p className="mt-1 text-[10px] leading-4 text-text-muted">
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
    <section className="overflow-hidden rounded-[26px] border border-border-subtle bg-surface-card p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-home-health">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
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
    <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-card px-3.5 py-3">
      <div className="h-2 w-2 shrink-0 rounded-full bg-home-health" />

      <span className="text-xs font-medium text-text-secondary">
        {text}
      </span>
    </div>
  );
}