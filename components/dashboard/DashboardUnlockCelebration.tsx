"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  ArrowRight,
  Check,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  usePermissions,
} from "@/hooks/usePermissions";

import {
  supabase,
} from "@/lib/supabase";

import {
  trackEvent,
} from "@/lib/analytics";

const REQUIRED_DEVICES = 3;

export default function DashboardUnlockCelebration() {
  const {
    user,
    householdId,
    isDemo,
    role,
    canCreate,
    loading: permissionsLoading,
  } = usePermissions();

  const [
    checking,
    setChecking,
  ] = useState(true);

  const [
    unlocked,
    setUnlocked,
  ] = useState(false);

  const [
    dismissed,
    setDismissed,
  ] = useState(false);

  useEffect(() => {
    if (permissionsLoading) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    if (
      params.get("first") !== "1" ||
      isDemo ||
      !user ||
      role === "viewer" ||
      !canCreate
    ) {
      setChecking(false);
      return;
    }

    const activeUser = user;

    let cancelled = false;

    async function checkUnlock() {
      try {
        let query =
          supabase
            .from("devices")
            .select(
              "id",
              {
                count: "exact",
                head: true,
              }
            );

        query =
          householdId
            ? query.eq(
                "household_id",
                householdId
              )
            : query.eq(
                "user_id",
                activeUser.id
              );

        const {
          count,
          error,
        } = await query;

        if (error) {
          console.error(
            "Unable to check dashboard unlock:",
            error
          );
          return;
        }

        if (cancelled) {
          return;
        }

        const deviceCount =
          count ?? 0;

        if (
          deviceCount >=
          REQUIRED_DEVICES
        ) {
          setUnlocked(true);

          const key =
            "htv:dashboard-unlock-ready";

          if (
            !window.sessionStorage.getItem(
              key
            )
          ) {
            trackEvent(
              "dashboard_unlock_ready_viewed",
              {
                funnel: "activation",
                device_count:
                  deviceCount,
              }
            );

            window.sessionStorage.setItem(
              key,
              "1"
            );
          }
        }
      } catch (error) {
        console.error(
          "Unable to check dashboard unlock:",
          error
        );
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    }

    void checkUnlock();

    return () => {
      cancelled = true;
    };
  }, [
    user,
    householdId,
    isDemo,
    role,
    canCreate,
    permissionsLoading,
  ]);

  if (
    checking ||
    !unlocked ||
    dismissed
  ) {
    return null;
  }

  function handleUnlock() {
    trackEvent(
      "dashboard_unlocked",
      {
        funnel: "activation",
        device_count:
          REQUIRED_DEVICES,
      }
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-unlock-title"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#101a22]/55 px-4 py-6 backdrop-blur-sm"
    >
      <section className="relative w-full max-w-[620px] overflow-hidden rounded-[32px] border border-white/20 bg-[#f8f5ef] shadow-[0_40px_120px_-45px_rgba(0,0,0,0.65)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#617c43]/15 blur-3xl"
        />

        <div className="relative p-6 text-center sm:p-9">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#617c43]/15 bg-[#617c43]/8 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#617c43]">
            <Sparkles size={13} />
            Milestone reached
          </div>

          <div className="relative mx-auto mt-7 flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#17212a] text-white shadow-[0_20px_45px_-24px_rgba(23,33,42,0.85)]">
            <LayoutDashboard
              size={31}
            />

            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-[#f8f5ef] bg-[#617c43] text-white">
              <Check
                size={14}
                strokeWidth={3}
              />
            </div>
          </div>

          <h1
            id="dashboard-unlock-title"
            className="mt-7 font-serif text-4xl font-medium leading-[1.02] tracking-[-0.045em] text-[#17212a] sm:text-5xl"
          >
            Your dashboard is ready.
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#69747a] sm:text-[15px]">
            You&apos;ve organized your first 3 devices.
            Home Tech Vault now has enough context
            to start showing a useful picture of
            your home technology.
          </p>

          <div className="mx-auto mt-7 grid max-w-md grid-cols-3 gap-2.5">
            {[
              "Device 1",
              "Device 2",
              "Device 3",
            ].map(
              (label) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#617c43]/15 bg-[#f0f4eb] p-3"
                >
                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#617c43] text-white">
                    <Check
                      size={15}
                      strokeWidth={3}
                    />
                  </div>

                  <p className="mt-2 text-[10px] font-semibold text-[#617c43]">
                    {label}
                  </p>
                </div>
              )
            )}
          </div>

          <div className="mx-auto mt-7 max-w-md rounded-2xl border border-[#17212a]/8 bg-white/60 p-4 text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#617c43]/10 text-[#617c43]">
                <ShieldCheck
                  size={18}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#17212a]">
                  Your vault has officially started.
                </p>

                <p className="mt-1 text-xs leading-5 text-[#727c81]">
                  Your dashboard can now surface devices,
                  documents, warranties, home insights,
                  and useful next steps.
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-7 max-w-md">
            <Link
              href="/dashboard?unlocked=1"
              onClick={handleUnlock}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#17212a] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(23,33,42,0.8)] transition hover:brightness-110"
            >
              Unlock my dashboard
              <ArrowRight
                size={17}
              />
            </Link>

            <button
              type="button"
              onClick={() =>
                setDismissed(true)
              }
              className="mt-3 min-h-10 w-full text-xs font-semibold text-[#7b8589] transition hover:text-[#17212a]"
            >
              Review this device first
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
