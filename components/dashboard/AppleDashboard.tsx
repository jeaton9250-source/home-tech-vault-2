"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

import {
  Activity,
  ArrowRight,
  CalendarDays,
  Camera,
  ChevronRight,
  CircleAlert,
  FileText,
  History,
  Home,
  Laptop,
  Loader2,
  Monitor,
  Package,
  PackagePlus,
  RefreshCw,
  Router,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Tv,
  Wifi,
  Wrench,
} from "lucide-react";

import {
  loadDashboardMetrics,
  type DashboardMetrics,
} from "@/lib/data/dashboardData";

import { applyHouseholdScope } from "@/lib/data/householdScope";

import { supabase } from "@/lib/supabase";

import { loadActivityFeed } from "@/lib/activity/loadActivityFeed";

import type { VaultActivityEvent } from "@/lib/activity/types";

import { getActivityIcon } from "@/lib/activity/icons";

import { demoActivityEvents } from "@/lib/activity/demoActivity";

import {
  demoDashboard,
  demoDevices,
  demoMaintenance,
  demoSubscriptions,
} from "@/lib/demoData";

import { buildDemoHomeHealth } from "@/lib/home-health/demo";

import { usePermissions } from "@/hooks/usePermissions";

type DashboardView = {
  firstName: string;
  householdName: string;
  protectedValue: number;
  overviewStats: DashboardMetrics["overviewStats"];
  homeHealth: DashboardMetrics["homeHealth"];
};

type DashboardExtraData = {
  upcomingMaintenanceCount: number | null;
  subscriptionCount: number | null;
  devices: DashboardDevice[];
  activity: VaultActivityEvent[];
};

type DashboardDevice = {
  id: string;
  device_name: string | null;
  brand: string | null;
  location: string | null;
  category: string | null;
  online: boolean | null;
};

type MaintenanceRow = {
  id: string;
  due_date: string | null;
  completed: boolean;
};

const EMPTY_EXTRAS: DashboardExtraData = {
  upcomingMaintenanceCount: null,
  subscriptionCount: null,
  devices: [],
  activity: [],
};

export default function AppleDashboard() {
  const {
    user,
    isDemo,
    householdId,
    householdOwnerId,
    loading: permissionsLoading,
  } = usePermissions();

  const [dashboard, setDashboard] = useState<DashboardView | null>(null);

  const [extras, setExtras] = useState<DashboardExtraData>(EMPTY_EXTRAS);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const loadDashboard = useCallback(
    async (background = false) => {
      if (permissionsLoading) {
        return;
      }

      /*
       * The public interactive demo intentionally
       * keeps demo data.
       *
       * A signed-in real account always uses
       * Supabase below.
       */
      if (isDemo && !user) {
        const demoHealth = buildDemoHomeHealth();

        const overviewStats = {
          deviceCount: demoDashboard.deviceCount,

          onlineDeviceCount: demoDevices.filter(
            (device) => device.online === true,
          ).length,

          offlineDeviceCount: demoDevices.filter(
            (device) => device.online === false,
          ).length,

          documentCount: demoDashboard.documentCount,

          activeWarrantyCount: demoDashboard.activeWarrantyCount,

          familyMemberCount: 4,
        };

        setDashboard({
          firstName: demoDashboard.firstName,

          householdName: demoDashboard.householdName,

          protectedValue: demoDashboard.protectedValue,

          overviewStats,

          homeHealth: demoHealth,
        });

        setExtras({
          upcomingMaintenanceCount: demoMaintenance.filter(
            (task) => !task.completed && isUpcomingDate(task.due_date),
          ).length,

          subscriptionCount: demoSubscriptions.length,

          devices: demoDevices.slice(0, 4).map((device) => ({
            id: device.id,
            device_name: device.device_name ?? null,
            brand: device.brand ?? null,
            location: device.location ?? null,
            category: device.category ?? null,
            online: device.online ?? null,
          })),

          activity: demoActivityEvents.slice(0, 4),
        });

        setErrorMessage("");
        setLastUpdatedAt(new Date());
        setLoading(false);
        setRefreshing(false);

        return;
      }

      if (!user) {
        setDashboard(null);
        setExtras(EMPTY_EXTRAS);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (background) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        /*
         * Core dashboard data.
         *
         * loadDashboardMetrics already handles:
         * - household scoping
         * - devices
         * - documents
         * - warranties
         * - protected value
         * - subscriptions
         * - network
         * - maintenance
         * - profile
         * - Home Health
         */
        const metricsPromise = loadDashboardMetrics(
          user,
          householdId,
          supabase,
        );

        /*
         * Extra data needed specifically for
         * this redesigned dashboard.
         */
        const maintenancePromise = applyHouseholdScope(
          supabase.from("maintenance_tasks").select("id, due_date, completed"),
          householdId,
          user.id,
        );

        const subscriptionsPromise = applyHouseholdScope(
          supabase.from("subscriptions").select("id", {
            count: "exact",
            head: true,
          }),
          householdId,
          user.id,
        );

        const devicesPromise = applyHouseholdScope(
          supabase
            .from("devices")
            .select(
              `
                  id,
                  device_name,
                  brand,
                  location,
                  category,
                  online
                `,
            )
            .order("device_name", {
              ascending: true,
            })
            .limit(4),
          householdId,
          user.id,
        );

        const activityPromise = loadActivityFeed({
          userId: user.id,

          householdId: householdId ?? null,

          householdOwnerId: householdOwnerId ?? user.id,

          limit: 4,
        });

        const [
          metrics,
          maintenanceResult,
          subscriptionsResult,
          devicesResult,
          activityEvents,
        ] = await Promise.all([
          metricsPromise,
          maintenancePromise,
          subscriptionsPromise,
          devicesPromise,
          activityPromise,
        ]);

        const maintenanceRows = maintenanceResult.error
          ? []
          : ((maintenanceResult.data ?? []) as MaintenanceRow[]);

        if (maintenanceResult.error) {
          console.error(
            "Dashboard maintenance count error:",
            maintenanceResult.error,
          );
        }

        if (subscriptionsResult.error) {
          console.error(
            "Dashboard subscriptions count error:",
            subscriptionsResult.error,
          );
        }

        if (devicesResult.error) {
          console.error("Dashboard device preview error:", devicesResult.error);
        }

        const upcomingMaintenanceCount = maintenanceResult.error
          ? null
          : maintenanceRows.filter(
              (task) => !task.completed && isUpcomingDate(task.due_date),
            ).length;

        setDashboard({
          firstName: metrics.firstName,

          householdName: metrics.householdName,

          protectedValue: metrics.protectedValue,

          overviewStats: metrics.overviewStats,

          homeHealth: metrics.homeHealth,
        });

        setExtras({
          upcomingMaintenanceCount,

          subscriptionCount: subscriptionsResult.error
            ? null
            : (subscriptionsResult.count ?? 0),

          devices: devicesResult.error
            ? []
            : ((devicesResult.data ?? []) as DashboardDevice[]),

          activity: activityEvents,
        });

        setLastUpdatedAt(new Date());
      } catch (error) {
        console.error("Apple dashboard loading error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your dashboard.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user, isDemo, householdId, householdOwnerId, permissionsLoading],
  );

  useEffect(() => {
    void loadDashboard(false);
  }, [loadDashboard]);

  /*
   * Refresh real data when returning to HTV
   * after changing a device, warranty,
   * maintenance task, document, etc.
   */
  useEffect(() => {
    function refreshOnFocus() {
      if (document.visibilityState === "visible") {
        void loadDashboard(true);
      }
    }

    window.addEventListener("focus", refreshOnFocus);

    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      window.removeEventListener("focus", refreshOnFocus);

      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [loadDashboard]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 18) {
      return "Good afternoon";
    }

    return "Good evening";
  }, []);

  if (loading || permissionsLoading) {
    return <DashboardLoading />;
  }

  if (!dashboard) {
    return (
      <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[22px] border border-[#e4e2dc] bg-[#fffefa] p-8">
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#17212a]">
            Your dashboard
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#68737b]">
            Sign in to view your Home Tech Vault.
          </p>
        </div>
      </main>
    );
  }

  const { overviewStats, homeHealth } = dashboard;

  const healthScore = homeHealth.score ?? 0;

  const healthStatus = homeHealth.status ?? "Needs Setup";

  const healthMessage =
    homeHealth.statusMessage ||
    "Keep adding details to strengthen your home record.";

  const recommendation = homeHealth.recommendation;

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 pb-28 pt-0 sm:px-6 md:pb-8 lg:px-7 xl:px-8">
      {errorMessage ? (
        <div className="mb-5 flex items-start justify-between gap-4 rounded-[18px] border border-[#a6584e]/20 bg-[#a6584e]/8 px-5 py-4">
          <div className="flex items-start gap-3">
            <CircleAlert size={18} className="mt-0.5 shrink-0 text-[#a6584e]" />

            <div>
              <p className="text-sm font-semibold text-[#17212a]">
                Some dashboard data could not be refreshed.
              </p>

              <p className="mt-1 text-xs leading-5 text-[#68737b]">
                {errorMessage}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-[12px] border border-[#e4e2dc] bg-[#fffefa] px-3 py-2 text-xs font-semibold text-[#52606a] transition hover:border-[#718d4f]/35 hover:text-[#526b39]"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      ) : null}

      {/* PERSONAL HOME HERO */}
      <section className="relative -mx-4 min-h-[270px] overflow-hidden border-b border-[#d8d0c3] bg-[#f2eee6] sm:-mx-6 lg:-mx-7 xl:-mx-8">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90')",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,244,237,0.97)_0%,rgba(247,244,237,0.88)_38%,rgba(247,244,237,0.34)_68%,rgba(247,244,237,0.08)_100%)]" />

        <div className="relative flex min-h-[270px] items-center px-7 py-8 md:px-10">
          <div className="max-w-[660px]">
            <h1 className="font-serif text-[44px] font-medium leading-[0.94] tracking-[-0.045em] text-[#17283a] sm:text-[58px] lg:text-[64px]">
              {greeting}, {dashboard.firstName}.
            </h1>

            <p className="mt-2 font-serif text-[22px] leading-tight text-[#293d4f] sm:text-[27px]">
              Here&apos;s what your home remembers today.
            </p>

            <button className="mt-5 inline-flex items-center gap-3 rounded-full border border-[#d8d0c3] bg-[#fffdf8]/95 px-4 py-2.5 text-sm font-semibold text-[#17283a] shadow-sm backdrop-blur">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#a9ad36] text-white">
                <Home size={14} />
              </span>
              {dashboard.householdName}
              <span className="font-normal text-[#7c8078]">· Your home</span>
            </button>
          </div>
        </div>
      </section>

      {/* THE MOCKUP'S PRIMARY DASHBOARD ROW */}
      <section className="mt-6 grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
        <article className="rounded-[24px] border border-[#ded7ca] bg-[#fffdf8] p-6 shadow-[0_8px_30px_rgba(23,40,58,0.05)] md:p-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-[30px] font-semibold tracking-[-0.025em] text-[#17283a]">A few things to care for</h2>
            <Link href="/maintenance" className="text-xs font-semibold text-[#858a2f]">View all →</Link>
          </div>
          <div className="mt-4 divide-y divide-[#ded7ca]">
            <CareRow icon={<Wrench size={19} />} title={recommendation?.title || "Keep your home record growing"} detail={recommendation?.description || "Add the next useful detail while it is fresh."} href={recommendation?.href || "/devices/add"} action="Review" />
            <CareRow icon={<CalendarDays size={19} />} title={extras.upcomingMaintenanceCount ? `${extras.upcomingMaintenanceCount} maintenance ${extras.upcomingMaintenanceCount === 1 ? "task" : "tasks"} coming up` : "Maintenance is up to date"} detail="Small reminders help the house keep running smoothly." href="/maintenance" action="View details" />
            <CareRow icon={<FileText size={19} />} title="Save a receipt or home document" detail="Keep proof, manuals and coverage beside the things you own." href="/documents/upload" action="Upload file" />
          </div>
        </article>

        <article className="rounded-[24px] border border-[#ded7ca] bg-[#fffdf8] p-6 shadow-[0_8px_30px_rgba(23,40,58,0.05)] md:p-7">
          <h2 className="font-serif text-[30px] font-semibold tracking-[-0.025em] text-[#17283a]">Your home at a glance</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_150px] sm:items-stretch">
            <div className="space-y-4">
              <GlanceRow icon={<Package size={18} />} value={overviewStats.deviceCount} label="things" detail="Appliances, systems and more" />
              <GlanceRow icon={<FileText size={18} />} value={overviewStats.documentCount} label="documents" detail="Manuals, warranties and receipts" />
              <GlanceRow icon={<CalendarDays size={18} />} value={extras.upcomingMaintenanceCount ?? 0} label="reminders" detail="So you can stay ahead" />
            </div>
            <div className="relative hidden overflow-hidden rounded-[18px] sm:block">
              <div className="absolute inset-0 bg-[url('/images/home-hero.jpg')] bg-cover bg-center" />
              <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(transparent,rgba(23,40,58,0.82))] px-4 pb-4 pt-12">
                <p className="font-serif text-lg italic leading-5 text-white">Same house.<br />A brighter tomorrow.</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-[32px] font-semibold tracking-[-0.025em] text-[#17283a]">Recently remembered</h2>
          <Link href="/activity" className="text-xs font-semibold text-[#858a2f]">View all activity →</Link>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {extras.activity.slice(0, 3).map((event) => <ActivityRow key={event.id} event={event} compact />)}
        </div>
        <Link href="/smart-search" className="mt-5 flex min-h-16 items-center gap-4 rounded-full border border-[#ded7ca] bg-[#fffdf8] px-5 shadow-[0_8px_30px_rgba(23,40,58,0.06)] transition hover:border-[#a9ad36]">
          <Sparkles size={20} className="text-[#a1a62f]" />
          <span className="flex-1 text-sm text-[#778078]">Ask anything about your home…</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a1a62f] text-white"><ArrowRight size={18} /></span>
        </Link>
      </section>

      {/* HEALTH + ACTIVITY */}
      <section className="mt-8 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <article className="rounded-[24px] border border-[#e4e2dc] bg-[#fffefa] p-6 shadow-[0_1px_2px_rgba(23,33,42,0.025)] md:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
                Home Tech Health
              </p>

              <div className="mt-3 flex items-end gap-3">
                <p className="text-[46px] font-semibold leading-none tracking-[-0.055em] text-[#17212a]">
                  {homeHealth.score ?? "—"}
                </p>

                {homeHealth.score !== null ? (
                  <span className="mb-1 text-sm text-[#829078]">/ 100</span>
                ) : null}
              </div>

              <p className="mt-3 text-[17px] font-semibold text-[#17212a]">
                {healthStatus}
              </p>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#68737b]">
                {healthMessage}
              </p>
            </div>

            <HealthRing score={healthScore} large />
          </div>

          {homeHealth.cards.length > 0 ? (
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {homeHealth.cards.slice(0, 4).map((card) => (
                <Link
                  key={card.key}
                  href={card.href}
                  className="rounded-[16px] bg-[#f8f6f0] px-4 py-4 transition hover:bg-[#f3f5ef]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-[#17212a]">
                      {card.title}
                    </p>

                    <span className="text-[11px] font-semibold text-[#617c43]">
                      {card.progress}%
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e4e2dc]">
                    <div
                      className="h-full rounded-full bg-[#617c43] transition-all"
                      style={{
                        width: `${Math.max(0, Math.min(100, card.progress))}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#829078]">
                    {card.summary}
                  </p>
                </Link>
              ))}
            </div>
          ) : null}

          {recommendation ? (
            <div className="mt-6 flex flex-col gap-4 rounded-[18px] border border-[#dfe6d7] bg-[#eef2e8]/70 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#718d4f]">
                  Recommended next step
                </p>

                <p className="mt-2 text-sm font-semibold text-[#17212a]">
                  {recommendation.title}
                </p>

                <p className="mt-1 max-w-xl text-xs leading-5 text-[#68737b]">
                  {recommendation.description}
                </p>
              </div>

              <Link
                href={recommendation.href}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[12px] bg-[#617c43] px-4 text-xs font-semibold text-white transition hover:bg-[#526b39]"
              >
                Review
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : null}
        </article>

        <article className="rounded-[24px] border border-[#e4e2dc] bg-[#fffefa] p-6 shadow-[0_1px_2px_rgba(23,33,42,0.025)] md:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
                Recent Activity
              </p>

              <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-[#17212a]">
                What changed recently
              </h2>
            </div>

            <Link
              href="/activity"
              className="text-xs font-semibold text-[#617c43] transition hover:text-[#526b39]"
            >
              View all
            </Link>
          </div>

          <div className="mt-6">
            {extras.activity.length > 0 ? (
              <div className="divide-y divide-[#e9e7e1]">
                {extras.activity.map((event) => (
                  <ActivityRow key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="rounded-[18px] bg-[#f8f6f0] px-5 py-8 text-center">
                <History size={22} className="mx-auto text-[#718d4f]" />

                <p className="mt-3 text-sm font-semibold text-[#17212a]">
                  No recent activity
                </p>

                <p className="mt-1 text-xs leading-5 text-[#829078]">
                  Changes to devices and network scans will appear here.
                </p>
              </div>
            )}
          </div>
        </article>
      </section>

      {/* REAL DEVICES */}
      <section className="mt-4 rounded-[24px] border border-[#e4e2dc] bg-[#fffefa] p-6 shadow-[0_1px_2px_rgba(23,33,42,0.025)] md:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
              Your Devices
            </p>

            <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-[#17212a]">
              Household technology
            </h2>
          </div>

          <Link
            href="/devices"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#617c43] transition hover:text-[#526b39]"
          >
            View all devices
            <ArrowRight size={14} />
          </Link>
        </div>

        {extras.devices.length > 0 ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {extras.devices.map((device) => (
              <DashboardDeviceCard key={device.id} device={device} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[18px] bg-[#f8f6f0] px-6 py-8 text-center">
            <Laptop size={24} className="mx-auto text-[#718d4f]" />

            <p className="mt-3 text-sm font-semibold text-[#17212a]">
              No devices yet
            </p>

            <p className="mt-1 text-xs text-[#829078]">
              Devices you add to your Vault will appear here.
            </p>

            <Link
              href="/devices/add"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-[12px] bg-[#617c43] px-4 text-xs font-semibold text-white transition hover:bg-[#526b39]"
            >
              Add Device
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

function DashboardDeviceCard({ device }: { device: DashboardDevice }) {
  const Icon = getDeviceIcon(device.category);

  const detail =
    [device.brand, device.location].filter(Boolean).join(" · ") ||
    "Device details";

  return (
    <Link
      href={`/devices/${device.id}`}
      className="group rounded-[18px] border border-[#e4e2dc] bg-[#f8f6f0] p-4 transition hover:-translate-y-0.5 hover:border-[#718d4f]/35 hover:bg-[#fffefa]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#eef2e8] text-[#617c43]">
          <Icon size={18} />
        </div>

        <ArrowRight
          size={14}
          className="text-[#a5b19a] transition group-hover:text-[#617c43]"
        />
      </div>

      <h3 className="mt-5 truncate text-sm font-semibold text-[#17212a]">
        {device.device_name || "Unnamed Device"}
      </h3>

      <p className="mt-1 truncate text-[11px] text-[#829078]">{detail}</p>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-[#68737b]">
        <span
          className={
            "h-1.5 w-1.5 rounded-full " +
            (device.online === true
              ? "bg-emerald-500"
              : device.online === false
                ? "bg-[#c3913d]"
                : "bg-[#c7ccc4]")
          }
        />

        {device.online === true
          ? "Online"
          : device.online === false
            ? "Offline"
            : "Status unavailable"}
      </div>
    </Link>
  );
}

function CareRow({
  icon,
  title,
  detail,
  href,
  action,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  href: string;
  action: string;
}) {
  return (
    <div className="flex items-center gap-4 py-4 first:pt-2 last:pb-1">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#edf0d9] text-[#747a2e]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#17283a]">{title}</p>
        <p className="mt-1 line-clamp-1 text-xs text-[#7b817b]">{detail}</p>
      </div>
      <Link href={href} className="hidden min-w-[108px] justify-center rounded-full border border-[#9a9d5b] px-4 py-2 text-xs font-semibold text-[#17283a] transition hover:bg-[#a1a62f] hover:text-white sm:inline-flex">
        {action}
      </Link>
    </div>
  );
}

function GlanceRow({
  icon,
  value,
  label,
  detail,
}: {
  icon: ReactNode;
  value: number;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0f1e7] text-[#17283a]">{icon}</span>
      <span className="min-w-8 font-serif text-[36px] leading-none text-[#17283a]">{value}</span>
      <div>
        <p className="text-sm font-semibold text-[#17283a]">{label}</p>
        <p className="mt-0.5 text-[11px] leading-4 text-[#7b817b]">{detail}</p>
      </div>
    </div>
  );
}

function ActivityRow({
  event,
  compact = false,
}: {
  event: VaultActivityEvent;
  compact?: boolean;
}) {
  const Icon = getActivityIcon(event.activityType);

  const href = event.deviceId ? `/devices/${event.deviceId}` : "/activity";

  return (
    <Link
      href={href}
      className={
        compact
          ? "group flex items-center gap-3 rounded-[16px] border border-[#ded7ca] bg-[#fffdf8] px-4 py-3 shadow-[0_3px_14px_rgba(23,40,58,0.04)]"
          : "group flex items-start gap-3 py-4 first:pt-0 last:pb-0"
      }
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#eef2e8] text-[#617c43]">
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#17212a]">
          {event.title}
        </p>

        {event.description ? (
          <p className="mt-1 line-clamp-1 text-[11px] text-[#829078]">
            {event.description}
          </p>
        ) : null}

        <p className="mt-1.5 text-[10px] text-[#9aa2a7]">
          {formatRelativeTime(event.occurredAt)}
        </p>
      </div>

      <ChevronRight
        size={14}
        className="mt-2 shrink-0 text-[#bbc3b4] transition group-hover:text-[#617c43]"
      />
    </Link>
  );
}

function HealthRing({
  score,
  large = false,
}: {
  score: number;
  large?: boolean;
}) {
  const size = large ? 104 : 78;

  const stroke = large ? 8 : 7;

  const radius = (size - stroke) / 2;

  const circumference = 2 * Math.PI * radius;

  const safeScore = Math.max(0, Math.min(100, score));

  const offset = circumference - (safeScore / 100) * circumference;

  return (
    <div
      className="relative shrink-0"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e4e2dc"
          strokeWidth={stroke}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#617c43"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={
            large
              ? "text-[25px] font-semibold tracking-[-0.04em] text-[#17212a]"
              : "text-[18px] font-semibold tracking-[-0.04em] text-[#17212a]"
          }
        >
          {Math.round(safeScore)}
        </span>
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex min-h-[520px] items-center justify-center rounded-[26px] border border-[#e4e2dc] bg-[#fffefa]">
        <div className="flex items-center gap-3 text-sm text-[#68737b]">
          <Loader2 size={20} className="animate-spin text-[#617c43]" />
          Loading your home...
        </div>
      </div>
    </main>
  );
}

function getDeviceIcon(category: string | null): ComponentType<{
  size?: number;
  className?: string;
}> {
  const normalized = category?.trim().toLowerCase() || "";

  if (
    normalized.includes("phone") ||
    normalized.includes("mobile") ||
    normalized.includes("tablet")
  ) {
    return Smartphone;
  }

  if (
    normalized.includes("tv") ||
    normalized.includes("television") ||
    normalized.includes("stream")
  ) {
    return Tv;
  }

  if (normalized.includes("camera")) {
    return Camera;
  }

  if (
    normalized.includes("router") ||
    normalized.includes("network") ||
    normalized.includes("wifi")
  ) {
    return Router;
  }

  if (
    normalized.includes("computer") ||
    normalized.includes("laptop") ||
    normalized.includes("mac")
  ) {
    return Laptop;
  }

  if (normalized.includes("monitor")) {
    return Monitor;
  }

  return Laptop;
}

function isUpcomingDate(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  const due = new Date(`${value}T23:59:59`);

  if (Number.isNaN(due.getTime())) {
    return false;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return due.getTime() >= today.getTime();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function formatProtectedValue(value: number) {
  if (value <= 0) {
    return "Home inventory";
  }

  return `${formatCurrency(value)} recorded value`;
}

function formatClockTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function formatRelativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const difference = Date.now() - date.getTime();

  const minutes = Math.floor(difference / (1000 * 60));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}
