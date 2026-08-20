"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Cpu,
  FileText,
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
  const router = useRouter();

  const {
    user,
    householdId,
    isDemo,
    role,
    canCreate,
    loading: permissionsLoading,
  } = usePermissions();

  const [visible, setVisible] =
    useState(false);

  const [previewMode, setPreviewMode] =
    useState(false);

  const [closing, setClosing] =
    useState(false);

  /*
   * Check whether this save completed
   * the user's three-device Vault
   * foundation.
   *
   * This intentionally remains
   * self-contained so the device success
   * page does not need to know the user's
   * current device count.
   */
  useEffect(() => {
    if (permissionsLoading) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    const isPreview =
      params.get(
        "vaultAchievement"
      ) === "preview";

    setPreviewMode(isPreview);

    /*
     * Development/design preview.
     */
    if (isPreview) {
      const timer =
        window.setTimeout(
          () => {
            setVisible(true);
          },
          180
        );

      return () => {
        window.clearTimeout(
          timer
        );
      };
    }

    /*
     * The existing first-device/build-vault
     * flow places this component on the
     * device-added success screen.
     *
     * Demo users and viewers should never
     * receive the real achievement.
     */
    if (
      params.get("first") !== "1" ||
      isDemo ||
      !user ||
      role === "viewer" ||
      !canCreate
    ) {
      return;
    }

    const activeUser = user;

    let cancelled = false;
    let showTimer:
      number | undefined;

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

        /*
         * Match the same ownership model
         * used throughout the Vault:
         * household devices when a household
         * is active, otherwise personal
         * devices for the authenticated user.
         */
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
            "Unable to check Vault activation:",
            error
          );
          return;
        }

        if (cancelled) {
          return;
        }

        const currentDeviceCount =
          count ?? 0;

        if (
          currentDeviceCount <
          REQUIRED_DEVICES
        ) {
          return;
        }

        /*
         * This is presentation state only,
         * not authorization state.
         *
         * Prevent the achievement from
         * repeatedly appearing in the same
         * browser after it has been earned.
         */
        const achievementKey =
          `htv:vault-activated:${activeUser.id}`;

        try {
          const hasSeen =
            window.localStorage.getItem(
              achievementKey
            ) === "1";

          if (hasSeen) {
            return;
          }

          window.localStorage.setItem(
            achievementKey,
            "1"
          );
        } catch {
          /*
           * Storage can be disabled by the
           * browser. The achievement should
           * still work if that happens.
           */
        }

        /*
         * Keep activation analytics from
         * firing repeatedly during the same
         * browser session.
         */
        try {
          const analyticsKey =
            `htv:vault-activation-viewed:${activeUser.id}`;

          if (
            !window.sessionStorage.getItem(
              analyticsKey
            )
          ) {
            trackEvent(
              "dashboard_unlock_ready_viewed",
              {
                funnel: "activation",
                device_count:
                  currentDeviceCount,
              }
            );

            window.sessionStorage.setItem(
              analyticsKey,
              "1"
            );
          }
        } catch {
          /*
           * Analytics must never block the
           * product experience.
           */
        }

        showTimer =
          window.setTimeout(
            () => {
              if (!cancelled) {
                setVisible(true);
              }
            },
            220
          );
      } catch (error) {
        console.error(
          "Unable to check Vault activation:",
          error
        );
      }
    }

    void checkUnlock();

    return () => {
      cancelled = true;

      if (
        showTimer !== undefined
      ) {
        window.clearTimeout(
          showTimer
        );
      }
    };
  }, [
    user,
    householdId,
    isDemo,
    role,
    canCreate,
    permissionsLoading,
  ]);

  /*
   * Prevent the page beneath the achievement
   * from scrolling while the full-screen
   * moment is active.
   */
  useEffect(() => {
    if (!visible) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape" &&
        !closing
      ) {
        setVisible(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    visible,
    closing,
  ]);

  function enterVault() {
    if (closing) {
      return;
    }

    if (!previewMode) {
      try {
        trackEvent(
          "dashboard_unlocked",
          {
            funnel: "activation",
            device_count:
              REQUIRED_DEVICES,
          }
        );
      } catch {
        /*
         * Navigation should never depend
         * on analytics succeeding.
         */
      }
    }

    setClosing(true);

    window.setTimeout(
      () => {
        /*
         * Preview mode closes the experience
         * without navigating away.
         */
        if (previewMode) {
          setVisible(false);
          setClosing(false);

          const url = new URL(
            window.location.href
          );

          url.searchParams.delete(
            "vaultAchievement"
          );

          window.history.replaceState(
            {},
            "",
            `${url.pathname}${url.search}${url.hash}`
          );

          return;
        }

        /*
         * The dark achievement layer dissolves,
         * then the user's newly unlocked
         * dashboard becomes the destination.
         */
        router.push(
          "/dashboard?unlocked=1"
        );
      },
      700
    );
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`
        fixed inset-0 z-[150]
        overflow-y-auto
        bg-[#101820]/96
        text-white
        backdrop-blur-2xl
        transition-all
        duration-700
        ease-[cubic-bezier(0.22,1,0.36,1)]
        ${
          closing
            ? "pointer-events-none opacity-0 backdrop-blur-none"
            : "opacity-100"
        }
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vault-activated-title"
    >
      {/* Ambient light */}
      <div
        className="
          pointer-events-none
          absolute inset-0
          overflow-hidden
        "
        aria-hidden
      >
        <div
          className="
            absolute
            left-1/2 top-[-180px]
            h-[520px] w-[760px]
            -translate-x-1/2
            rounded-full
            bg-[#617c43]/22
            blur-[110px]
          "
        />

        <div
          className="
            absolute
            bottom-[-240px]
            left-[-160px]
            h-[520px] w-[520px]
            rounded-full
            bg-[#8ea271]/10
            blur-[120px]
          "
        />

        <div
          className="
            absolute
            right-[-180px]
            top-1/3
            h-[440px] w-[440px]
            rounded-full
            bg-[#d8cdb2]/7
            blur-[120px]
          "
        />

        <span className="absolute left-[14%] top-[19%] h-1 w-1 rounded-full bg-white/50 motion-safe:animate-pulse" />
        <span className="absolute left-[23%] top-[34%] h-1.5 w-1.5 rounded-full bg-[#9fb383]/60 motion-safe:animate-pulse" />
        <span className="absolute right-[17%] top-[24%] h-1 w-1 rounded-full bg-white/45 motion-safe:animate-pulse" />
        <span className="absolute right-[25%] top-[42%] h-1.5 w-1.5 rounded-full bg-[#9fb383]/50 motion-safe:animate-pulse" />
        <span className="absolute bottom-[22%] left-[18%] h-1 w-1 rounded-full bg-white/35 motion-safe:animate-pulse" />
        <span className="absolute bottom-[17%] right-[19%] h-1 w-1 rounded-full bg-white/35 motion-safe:animate-pulse" />
      </div>

      <div
        className="
          relative mx-auto
          flex min-h-screen
          w-full max-w-[820px]
          items-center
          px-5 py-10
          sm:px-8
        "
      >
        <div
          className={`
            w-full
            transition-all
            duration-500
            ease-[cubic-bezier(0.22,1,0.36,1)]
            ${
              closing
                ? "-translate-y-3 scale-[1.015] opacity-0 blur-[2px]"
                : "translate-y-0 scale-100 opacity-100 blur-0"
            }
          `}
        >
          {/* Achievement label */}
          <div className="flex justify-center">
            <div
              className="
                inline-flex
                items-center gap-2
                rounded-full
                border border-[#8da36e]/25
                bg-[#617c43]/12
                px-4 py-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-[#b9c8a4]
              "
            >
              <Sparkles
                size={13}
                aria-hidden
              />
              Milestone reached
            </div>
          </div>

          {/* Vault emblem */}
          <div
            className="
              relative mx-auto
              mt-9 flex
              h-[156px] w-[156px]
              items-center justify-center
            "
            aria-hidden
          >
            <div
              className="
                absolute inset-0
                rounded-full
                border border-[#91a777]/20
                bg-[#617c43]/8
                shadow-[0_0_80px_rgba(97,124,67,0.22)]
                motion-safe:animate-pulse
              "
            />

            <div
              className="
                absolute inset-[13px]
                rounded-full
                border border-white/8
              "
            />

            <div
              className="
                absolute inset-[25px]
                rounded-full
                border border-[#91a777]/24
                bg-[#17212a]
                shadow-[inset_0_0_28px_rgba(255,255,255,0.025)]
              "
            />

            {/* Vault dial marks */}
            <div className="absolute left-1/2 top-[12px] h-[14px] w-px -translate-x-1/2 bg-[#9eb184]/45" />
            <div className="absolute bottom-[12px] left-1/2 h-[14px] w-px -translate-x-1/2 bg-[#9eb184]/45" />
            <div className="absolute left-[12px] top-1/2 h-px w-[14px] -translate-y-1/2 bg-[#9eb184]/45" />
            <div className="absolute right-[12px] top-1/2 h-px w-[14px] -translate-y-1/2 bg-[#9eb184]/45" />

            <div
              className="
                relative flex
                h-[72px] w-[72px]
                items-center justify-center
                rounded-[24px]
                bg-[#617c43]
                text-white
                shadow-[0_12px_32px_rgba(97,124,67,0.34)]
              "
            >
              <ShieldCheck
                size={36}
                strokeWidth={1.7}
              />
            </div>

            <Sparkles
              size={17}
              className="
                absolute
                -right-2 top-5
                text-[#c8d6b4]
                motion-safe:animate-pulse
              "
            />

            <Sparkles
              size={13}
              className="
                absolute
                bottom-8 -left-1
                text-white/50
                motion-safe:animate-pulse
              "
            />
          </div>

          {/* Main copy */}
          <div className="mx-auto mt-8 max-w-2xl text-center">
            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.24em]
                text-[#98ac7e]
              "
            >
              Vault activated
            </p>

            <h1
              id="vault-activated-title"
              className="
                mt-4
                font-serif
                text-[2.6rem]
                font-medium
                leading-[0.98]
                tracking-[-0.045em]
                text-[#f6f3ec]
                sm:text-[3.7rem]
              "
            >
              Your home tech
              <span className="block text-[#a9bc8e]">
                finally has a home.
              </span>
            </h1>

            <p
              className="
                mx-auto mt-5
                max-w-xl
                text-sm
                leading-7
                text-[#aab3b7]
                sm:text-base
              "
            >
              You&apos;ve organized your first
              three devices. Your Home Tech Vault
              dashboard is now fully unlocked and
              ready to become the command center
              for your home technology.
            </p>
          </div>

          {/* Foundation completion */}
          <div
            className="
              mx-auto mt-8
              max-w-[520px]
              rounded-[26px]
              border border-white/8
              bg-white/[0.035]
              p-5
              shadow-[0_24px_80px_rgba(0,0,0,0.22)]
              backdrop-blur-xl
              sm:p-6
            "
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-[#8d999d]
                  "
                >
                  Vault foundation
                </p>

                <p
                  className="
                    mt-1
                    text-base
                    font-semibold
                    text-[#f1efe9]
                  "
                >
                  3 devices organized
                </p>
              </div>

              <div
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-full
                  bg-[#617c43]/20
                  text-[#b8c9a3]
                "
              >
                <Check
                  size={19}
                  strokeWidth={2.2}
                />
              </div>
            </div>

            <div
              className="
                mt-5 h-1.5
                overflow-hidden
                rounded-full
                bg-white/8
              "
            >
              <div
                className="
                  h-full w-full
                  rounded-full
                  bg-[#7e9860]
                  shadow-[0_0_20px_rgba(126,152,96,0.45)]
                "
              />
            </div>

            <div
              className="
                mt-3
                flex items-center
                justify-between
                text-[11px]
                text-[#829096]
              "
            >
              <span>
                Foundation complete
              </span>

              <span className="font-semibold text-[#b4c59f]">
                3 / 3
              </span>
            </div>
          </div>

          {/* Achievement chips */}
          <div
            className="
              mx-auto mt-5
              grid max-w-[620px]
              gap-2.5
              sm:grid-cols-3
            "
          >
            <AchievementItem
              icon={Cpu}
              label="Devices organized"
            />

            <AchievementItem
              icon={ShieldCheck}
              label="Dashboard unlocked"
            />

            <AchievementItem
              icon={FileText}
              label="Vault ready"
            />
          </div>

          {/* CTA */}
          <div
            className="
              mx-auto mt-8
              max-w-[430px]
              text-center
            "
          >
            <button
              type="button"
              onClick={enterVault}
              disabled={closing}
              autoFocus
              className="
                group
                flex w-full
                items-center justify-center
                gap-2
                rounded-2xl
                bg-[#f3f0e8]
                px-6 py-4
                text-sm
                font-semibold
                text-[#17212a]
                shadow-[0_18px_45px_rgba(0,0,0,0.24)]
                transition
                duration-300
                hover:-translate-y-0.5
                hover:bg-white
                disabled:cursor-wait
                focus:outline-none
                focus:ring-2
                focus:ring-[#9bb281]
                focus:ring-offset-2
                focus:ring-offset-[#101820]
              "
            >
              {closing
                ? "Opening Your Vault..."
                : "Enter My Vault"}

              <ChevronRight
                size={17}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-0.5
                "
              />
            </button>

            <p
              className="
                mt-4
                text-xs
                leading-5
                text-[#77858b]
              "
            >
              Next, strengthen your Vault with
              warranties, documents, and network
              details.
            </p>

            {previewMode ? (
              <p
                className="
                  mt-3
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.15em]
                  text-[#9bb281]
                "
              >
                Preview mode
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

type AchievementItemProps = {
  icon: typeof Cpu;
  label: string;
};

function AchievementItem({
  icon: Icon,
  label,
}: AchievementItemProps) {
  return (
    <div
      className="
        flex items-center
        justify-center gap-2.5
        rounded-2xl
        border border-white/7
        bg-white/[0.025]
        px-3 py-3
        text-xs
        font-medium
        text-[#bbc2c3]
      "
    >
      <Icon
        size={15}
        className="text-[#91a777]"
        aria-hidden
      />

      {label}
    </div>
  );
}
