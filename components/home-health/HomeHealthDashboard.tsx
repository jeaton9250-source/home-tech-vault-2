"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  House,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

import DashboardHero from "@/components/dashboard/DashboardHero";
import HomeAdvisorPreview from "@/components/advisor/HomeAdvisorPreview";
import SmartSearch from "@/components/search/SmartSearch";
import VaultSetupProgress from "@/components/dashboard/VaultSetupProgress";
import { useHomeAdvisor } from "@/hooks/useHomeAdvisor";
import { usePermissions } from "@/hooks/usePermissions";
import { useClientVaultMode } from "@/hooks/useClientVaultMode";
import { getHomeHealthDisplayMessage } from "@/lib/home-health/display";
import type { DashboardOverviewStats } from "@/lib/dashboard/types";
import type {
  HomeHealthHighlight,
  HomeHealthResult,
} from "@/lib/home-health/types";

type HomeHealthDashboardProps = {
  firstName: string;
  homeHealth: HomeHealthResult;
  overviewStats: DashboardOverviewStats;
  hasHousehold: boolean;
};

function getHighlightHref(highlight: HomeHealthHighlight) {
  switch (highlight.id) {
    case "warranty-expiring":
    case "warranty-missing":
      return "/warranties";

    case "maintenance-overdue":
    case "maintenance-upcoming":
      return "/maintenance";

    case "network-missing":
      return "/network/edit";

    case "documents-secured":
      return "/documents";

    case "devices-protected":
      return "/devices";

    case "network-configured":
      return "/network";

    default:
      return "/dashboard";
  }
}

function getAttentionDescription(id: string) {
  switch (id) {
    case "warranty-expiring":
      return "Review coverage and make sure proof of purchase is saved.";

    case "warranty-missing":
      return "Add coverage dates so Home Tech Vault can track them for you.";

    case "maintenance-overdue":
      return "A scheduled home task has passed its due date.";

    case "maintenance-upcoming":
      return "A scheduled home task is coming up soon.";

    case "network-missing":
      return "Add your home network so important Wi-Fi details stay organized.";

    default:
      return "Review this item to keep your home record up to date.";
  }
}

export default function HomeHealthDashboard({
  firstName,
  homeHealth,
  overviewStats,
  hasHousehold,
}: HomeHealthDashboardProps) {
  const {
    isDemo,
    canCreate,
  } = usePermissions();

  const {
    active: isClientVaultMode,
  } = useClientVaultMode();

  const {
    advisor,
    loading: advisorLoading,
    error: advisorError,
  } = useHomeAdvisor({
    defer: true,
  });

  const healthSummary = homeHealth.status
    ? getHomeHealthDisplayMessage(homeHealth.status)
    : null;

  const attentionItems = homeHealth.highlights.filter(
    (highlight) => highlight.tone === "warning"
  );

  const positiveItems = homeHealth.highlights.filter(
    (highlight) => highlight.tone === "positive"
  );

  const attentionCount = attentionItems.length;

  return (
    <div className="mx-auto w-full max-w-[1240px] pb-14">
      {/* HERO */}
      <DashboardHero
        firstName={firstName}
        score={homeHealth.score}
        healthSummary={healthSummary}
      />

      {/* HOME HEALTH FEED */}
      <section className="mt-5 overflow-hidden rounded-[28px] border border-[#182533]/10 bg-[#f8f5ef] shadow-[0_22px_60px_-42px_rgba(15,25,35,0.5)]">
        <div className="border-b border-[#182533]/8 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-6 bg-[#617c43]" />
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#617c43]">
                  Home Health
                </p>
              </div>

              <h2 className="mt-3 font-serif text-2xl font-medium tracking-[-0.035em] text-[#17212a] sm:text-3xl">
                {attentionCount > 0
                  ? `${attentionCount} ${
                      attentionCount === 1 ? "thing needs" : "things need"
                    } your attention`
                  : "Your home is looking good"}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68737b]">
                {attentionCount > 0
                  ? "Here are the most useful things to take care of next."
                  : "Nothing urgent is showing right now. Keep building your home record as things change."}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-[#182533]/8 bg-[#eee9df]/70 px-4 py-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7b858c]">
                  Vault documented
                </p>
                <p className="mt-0.5 font-serif text-2xl font-medium tracking-[-0.04em] text-[#17212a]">
                  {homeHealth.vaultCompleteness}%
                </p>
              </div>

              <div className="h-10 w-px bg-[#182533]/10" />

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7b858c]">
                  Health
                </p>
                <p className="mt-1 text-sm font-semibold text-[#617c43]">
                  {homeHealth.status ?? "Getting started"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {attentionItems.length > 0 ? (
            <div className="space-y-2.5">
              {attentionItems.map((item) => (
                <AttentionRow
                  key={item.id}
                  item={item}
                  href={getHighlightHref(item)}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-4 rounded-2xl border border-[#617c43]/15 bg-[#617c43]/[0.055] p-4 sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#617c43]/10 text-[#617c43]">
                <CheckCircle2 size={19} aria-hidden />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#17212a]">
                  Nothing urgent right now
                </p>
                <p className="mt-1 text-xs leading-5 text-[#68737b]">
                  Home Tech Vault will surface warranty, maintenance,
                  documentation, and network issues here when they need
                  your attention.
                </p>
              </div>
            </div>
          )}

          {positiveItems.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {positiveItems.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={getHighlightHref(item)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#617c43]/12 bg-[#617c43]/[0.055] px-3 py-2 text-[11px] font-medium text-[#52663d] transition hover:bg-[#617c43]/10"
                >
                  <CheckCircle2 size={13} aria-hidden />
                  {item.message}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* NEXT BEST ACTION */}
      {homeHealth.recommendation ? (
        <section className="mt-5 overflow-hidden rounded-[26px] border border-[#182533]/10 bg-[#183047] text-[#f5f1e8] shadow-[0_24px_55px_-40px_rgba(0,0,0,0.65)]">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-6 bg-[#8ca768]" />
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9ab679]">
                Improve Your Home
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#8ca768]/12 text-[#a8c488]">
                  <Sparkles size={19} aria-hidden />
                </div>

                <div className="min-w-0">
                  <h2 className="font-serif text-xl font-medium tracking-[-0.03em] text-[#f5f1e8] sm:text-2xl">
                    {homeHealth.recommendation.title}
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b5bec5]">
                    {homeHealth.recommendation.description}
                  </p>

                  <p className="mt-2 text-[11px] font-medium text-[#8fa0aa]">
                    About {homeHealth.recommendation.estimate}
                  </p>
                </div>
              </div>

              <Link
                href={homeHealth.recommendation.href}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#f5f1e8] px-4 py-2.5 text-xs font-semibold text-[#183047] transition hover:bg-white"
              >
                Take action
                <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* HOME AT A GLANCE */}
      <section className="mt-5">
        <div className="mb-3 flex items-center gap-3 px-1">
          <span className="h-px w-6 bg-[#617c43]" />
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#617c43]">
            Home at a glance
          </p>
        </div>

        <div className="grid overflow-hidden rounded-[22px] border border-[#182533]/10 bg-[#f8f5ef] shadow-[0_16px_40px_-36px_rgba(15,25,35,0.4)] sm:grid-cols-2 lg:grid-cols-4">
          <SnapshotCard
            icon={House}
            label="Devices"
            value={overviewStats.deviceCount}
            detail={`${overviewStats.onlineDeviceCount} online`}
            href="/devices"
          />

          <SnapshotCard
            icon={FileText}
            label="Documents"
            value={overviewStats.documentCount}
            detail="Stored in your Vault"
            href="/documents"
          />

          <SnapshotCard
            icon={ShieldCheck}
            label="Active warranties"
            value={overviewStats.activeWarrantyCount}
            detail="Coverage tracked"
            href="/warranties"
          />

          <SnapshotCard
            icon={Wrench}
            label="Vault completeness"
            value={`${homeHealth.vaultCompleteness}%`}
            detail="Home documented"
            href="/insights"
          />
        </div>
      </section>

      {/* ASK YOUR VAULT + ADVISOR */}
      {!isClientVaultMode ? (
        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="relative overflow-hidden rounded-[26px] border border-[#182533]/10 bg-[#183047] p-6 text-[#f5f1e8] shadow-[0_24px_55px_-40px_rgba(0,0,0,0.7)]">
            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#718d4f]/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="h-px w-6 bg-[#718d4f]" />
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#89a566]">
                  Ask Your Vault
                </p>
              </div>

              <h2 className="mt-3 font-serif text-2xl font-medium tracking-[-0.03em] text-[#f5f1e8]">
                Find anything in your home.
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#aab4bc]">
                Search devices, warranties, documents, and household
                information from one place.
              </p>

              <div className="mt-5">
                <SmartSearch
                  mode="dashboard"
                  variant="hero"
                />
              </div>
            </div>
          </section>

          <SectionShell
            eyebrow="Home Advisor"
            title="Understand what matters next"
          >
            <HomeAdvisorPreview
              advisor={advisor}
              loading={advisorLoading}
              error={advisorError}
            />
          </SectionShell>
        </div>
      ) : null}

      {/* NEW VAULT HELP */}
      {overviewStats.deviceCount <= 2 &&
      overviewStats.documentCount === 0 ? (
        <section className="mt-5 overflow-hidden rounded-[26px] border border-[#182533]/10 bg-[#f8f5ef] p-5 shadow-[0_18px_45px_-36px_rgba(15,25,35,0.45)] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-6 bg-[#617c43]" />
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
              Keep building your vault
            </p>
          </div>

          <h2 className="mt-3 font-serif text-xl font-medium tracking-[-0.03em] text-[#17212a] sm:text-2xl">
            Add what would be useful later.
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#68737b]">
            You do not need to finish everything today. Save the next
            detail you would hate to search for when something goes wrong.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StarterAction
              href="/documents/upload"
              title="Save a document"
              description="Receipt, warranty, or manual"
            />

            <StarterAction
              href="/maintenance/new"
              title="Add maintenance"
              description="Remember the next home task"
            />

            <StarterAction
              href="/network/edit"
              title="Add Home Wi-Fi"
              description="Keep router and internet details handy"
            />
          </div>
        </section>
      ) : null}

      {!isDemo ? (
        <div className="mt-5">
          <VaultSetupProgress
            deviceCount={overviewStats.deviceCount}
            documentCount={overviewStats.documentCount}
            hasHousehold={hasHousehold}
            canCreate={canCreate}
          />
        </div>
      ) : null}
    </div>
  );
}

function AttentionRow({
  item,
  href,
}: {
  item: HomeHealthHighlight;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-[#b58a42]/15 bg-[#b58a42]/[0.045] p-4 transition hover:border-[#b58a42]/25 hover:bg-[#b58a42]/[0.075]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#b58a42]/10 text-[#9a7336]">
        <AlertTriangle size={18} aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#17212a]">
          {item.message}
        </p>

        <p className="mt-1 text-xs leading-5 text-[#778188]">
          {getAttentionDescription(item.id)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#617c43]">
        <span className="hidden sm:inline">
          View
        </span>
        <ArrowRight
          size={14}
          className="transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </div>
    </Link>
  );
}

function SnapshotCard({
  icon: Icon,
  label,
  value,
  detail,
  href,
}: {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean;
  }>;
  label: string;
  value: number | string;
  detail: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group min-w-0 border-b border-[#182533]/8 px-4 py-4 transition hover:bg-[#eee9df]/45 sm:even:border-l lg:border-b-0 lg:border-l-0 lg:border-r lg:last:border-r-0"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#617c43]/10 text-[#617c43]">
          <Icon size={16} aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-[11px] font-semibold text-[#56616a]">
              {label}
            </p>

            <span className="shrink-0 font-serif text-xl font-medium tracking-[-0.04em] text-[#17212a]">
              {value}
            </span>
          </div>

          <p className="mt-0.5 truncate text-[10px] text-[#8a949b]">
            {detail}
          </p>
        </div>
      </div>
    </Link>
  );
}

function StarterAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-[#182533]/10 bg-[#eee9df]/55 p-4 transition hover:-translate-y-0.5 hover:bg-[#eee9df]"
    >
      <p className="text-sm font-semibold text-[#17212a]">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-[#68737b]">
        {description}
      </p>

      <p className="mt-3 text-xs font-semibold text-[#617c43]">
        Add now →
      </p>
    </Link>
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
