"use client";

import {
  useEffect,
  useState,
  type ComponentType,
} from "react";

import {
  ArrowRight,
  Building2,
  FileText,
  Laptop,
  Plus,
  Radar,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

import { loadDashboardMetrics } from "@/lib/data/dashboardData";
import { usePermissions } from "@/hooks/usePermissions";

import HomeHealth from "@/components/brand/HomeHealth";
import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

import RecentActivity from "@/components/dashboard/RecentActivity";
import RecentNotifications from "@/components/dashboard/RecentNotifications";

import type { VaultScoreResult } from "@/lib/calculateVaultScore";

import { brand, sections } from "@/lib/design-system/tokens";
import { demoDashboard } from "@/lib/demoData";

import { cn } from "@/lib/design-system/cn";

type DashboardIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

const defaultVaultScore: VaultScoreResult = {
  total: 0,
  protection: 0,
  organization: 0,
  documentation: 0,
  maintenance: 0,
  label: "Get Started",
  recommendations: [],
};

export default function DashboardPage() {
  const {
    user,
    isDemo,
    householdId,
    loading: permissionsLoading,
    getActionHref,
    getActionLabel,
  } = usePermissions();

  const [firstName, setFirstName] =
    useState("Homeowner");

  const [householdName, setHouseholdName] =
    useState("My Home Tech Vault");

  const [deviceCount, setDeviceCount] =
    useState(0);

  const [documentCount, setDocumentCount] =
    useState(0);

  const [roomCount, setRoomCount] =
    useState(0);

  const [familyMemberCount, setFamilyMemberCount] =
    useState(0);

  const [protectedValue, setProtectedValue] =
    useState(0);

  const [vaultScore, setVaultScore] =
    useState<VaultScoreResult>(
      defaultVaultScore
    );

  const [
    loadingDashboard,
    setLoadingDashboard,
  ] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoadingDashboard(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setFirstName(demoDashboard.firstName);
          setHouseholdName(
            demoDashboard.householdName
          );
          setDeviceCount(
            demoDashboard.deviceCount
          );
          setDocumentCount(
            demoDashboard.documentCount
          );
          setRoomCount(6);
          setFamilyMemberCount(3);
          setProtectedValue(
            demoDashboard.protectedValue
          );
          setVaultScore({
            total: 96,
            protection: 94,
            organization: 96,
            documentation: 88,
            maintenance: 90,
            label: "Excellent",
            recommendations: [
              "Upload the missing printer receipt.",
              "Complete the upcoming router firmware update.",
            ],
          });

          return;
        }

        const metrics =
          await loadDashboardMetrics(
            user,
            householdId
          );

        setFirstName(metrics.firstName);
        setHouseholdName(
          metrics.householdName
        );
        setDeviceCount(metrics.deviceCount);
        setDocumentCount(
          metrics.documentCount
        );
        setRoomCount(metrics.roomCount);
        setFamilyMemberCount(
          metrics.familyMemberCount
        );
        setProtectedValue(
          metrics.protectedValue
        );
        setVaultScore(metrics.vaultScore);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load your dashboard.";

        setErrorMessage(message);
      } finally {
        setLoadingDashboard(false);
      }
    }

    void loadDashboard();
  }, [
    user,
    isDemo,
    householdId,
    permissionsLoading,
  ]);

  const healthMessage =
    vaultScore.total >= 90
      ? "Your home technology is well protected and thoughtfully organized."
      : vaultScore.total >= 75
        ? "Your household records are in good shape with room to refine."
        : vaultScore.recommendations[0] ||
          "A few calm improvements could strengthen your vault.";

  const primaryRecommendation =
    vaultScore.recommendations[0];

  if (
    permissionsLoading ||
    loadingDashboard
  ) {
    return (
      <PageShell>
        <DashboardSkeleton />
      </PageShell>
    );
  }

  if (errorMessage) {
    return (
      <PageShell>
        <PageCard className="border-danger/30 bg-danger-soft text-danger">
          <h1 className="text-section-title">
            Unable to load dashboard
          </h1>
          <p className="mt-2 text-sm">
            {errorMessage}
          </p>
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="htv-hero-band overflow-hidden p-8 md:p-10">
        <div className="flex flex-col gap-10 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <p
              className="text-overline"
              style={{
                color: sections.homeHealth.accent,
              }}
            >
              {brand.greeting}
            </p>

            <h1 className="text-hero mt-3 text-text-primary">
              Welcome home, {firstName}.
            </h1>

            <p className="mt-4 text-base leading-7 text-text-secondary">
              {householdName} · Your home technology
              operating system is calm, protected, and
              ready.
            </p>

            <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
              {healthMessage}
            </p>

            {isDemo && (
              <p className="mt-5 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card/80 px-4 py-3 text-sm text-text-secondary shadow-[var(--shadow-sm)]">
                You are exploring a sample household.
                Create an account to organize your own
                home.
              </p>
            )}
          </div>

          <HomeHealth
            score={vaultScore.total}
            label={vaultScore.label}
            protection={vaultScore.protection}
            organization={vaultScore.organization}
            documentation={vaultScore.documentation}
            maintenance={vaultScore.maintenance}
          />
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={Laptop}
          label="Devices"
          value={deviceCount}
          tint={sections.technology.soft}
          accent={sections.technology.accent}
        />
        <StatTile
          icon={FileText}
          label="Documents"
          value={documentCount}
          tint={sections.digitalVault.soft}
          accent={sections.digitalVault.accent}
        />
        <StatTile
          icon={Building2}
          label="Rooms"
          value={roomCount}
          tint={sections.network.soft}
          accent={sections.network.accent}
        />
        <StatTile
          icon={Users}
          label="Family"
          value={familyMemberCount}
          tint={sections.insights.soft}
          accent={sections.insights.accent}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <PageCard interactive>
          <p className="text-overline">
            Protected Assets
          </p>

          <p className="text-hero mt-3 text-text-primary">
            {formatCurrency(protectedValue)}
          </p>

          <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
            Total purchase value recorded across your
            household technology inventory.
          </p>

          <div className="mt-8 h-px bg-border-subtle" />

          <p className="mt-6 text-sm text-text-secondary">
            Every device, document, and warranty contributes
            to the story of your home.
          </p>
        </PageCard>

        {primaryRecommendation && (
          <PageCard
            interactive
            className="border-border-subtle bg-gradient-to-br from-premium-soft/80 via-surface-card to-surface-base"
          >
            <div className="flex h-full flex-col">
              <p
                className="text-overline"
                style={{
                  color: sections.insights.accent,
                }}
              >
                Today&apos;s Focus
              </p>

              <div className="mt-4 flex items-start gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle shadow-[var(--shadow-inset)]"
                  style={{
                    background:
                      sections.insights.soft,
                    color:
                      sections.insights.accent,
                  }}
                >
                  <Sparkles size={20} />
                </div>

                <div>
                  <h2 className="text-section-title text-text-primary">
                    {primaryRecommendation}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    Personalized guidance based on your
                    current vault health.
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-8">
                <Button
                  href="/insights"
                  variant="secondary"
                >
                  View insights
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </PageCard>
        )}
      </section>

      <PageCard>
        <p className="text-overline">
          Quick Actions
        </p>

        <h2 className="text-section-title mt-2 text-text-primary">
          What would you like to do?
        </h2>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction
            href={getActionHref(
              "/devices/add",
              "devices"
            )}
            icon={Plus}
            label={getActionLabel(
              "Add Device"
            )}
            tint={sections.technology.soft}
            accent={sections.technology.accent}
          />
          <QuickAction
            href={getActionHref(
              "/documents/upload",
              "documents"
            )}
            icon={FileText}
            label={getActionLabel(
              "Upload Document"
            )}
            tint={sections.digitalVault.soft}
            accent={sections.digitalVault.accent}
          />
          <QuickAction
            href={getActionHref(
              "/network/discover",
              "networkDiscover"
            )}
            icon={Radar}
            label={getActionLabel(
              "Scan Network"
            )}
            tint={sections.network.soft}
            accent={sections.network.accent}
          />
          <QuickAction
            href={getActionHref(
              "/maintenance",
              "maintenance"
            )}
            icon={Wrench}
            label={getActionLabel(
              "Maintenance"
            )}
            tint={sections.homeHealth.soft}
            accent={sections.homeHealth.accent}
          />
        </div>
      </PageCard>

      <section className="grid gap-6 xl:grid-cols-2">
        <RecentActivity />

        <RecentNotifications />
      </section>
    </PageShell>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tint,
  accent,
}: {
  icon: DashboardIcon;
  label: string;
  value: number;
  tint: string;
  accent: string;
}) {
  return (
    <div className="htv-card-interactive rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-5 shadow-[var(--shadow-sm),var(--shadow-inset)]">
      <div
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle shadow-[var(--shadow-inset)]"
        style={{
          background: tint,
          color: accent,
        }}
      >
        <Icon size={18} />
      </div>

      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-text-secondary">
        {label}
      </p>

      <p className="mt-2 text-2xl font-medium tabular-nums tracking-[-0.02em] text-text-primary">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  tint,
  accent,
}: {
  href: string;
  icon: DashboardIcon;
  label: string;
  tint: string;
  accent: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "htv-card-interactive group flex items-center gap-3 rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-4 shadow-[var(--shadow-sm)]"
      )}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle shadow-[var(--shadow-inset)]"
        style={{
          background: tint,
          color: accent,
        }}
      >
        <Icon size={18} />
      </div>

      <span className="min-w-0 flex-1 text-sm font-medium text-text-primary">
        {label}
      </span>

      <ArrowRight
        size={16}
        className="shrink-0 text-text-tertiary transition group-hover:translate-x-0.5 group-hover:text-interaction"
      />
    </a>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
