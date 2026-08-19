"use client";

import Link from "next/link";

import {
  ArrowRight,
  Check,
  LockKeyhole,
  ScanBarcode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type DashboardUnlockGateProps = {
  firstName: string;
  deviceCount: number;
};

const REQUIRED_DEVICES = 3;

export default function DashboardUnlockGate({
  firstName,
  deviceCount,
}: DashboardUnlockGateProps) {
  const progress =
    Math.min(
      Math.max(
        deviceCount,
        0
      ),
      REQUIRED_DEVICES
    );

  const remaining =
    Math.max(
      REQUIRED_DEVICES -
        progress,
      0
    );

  const percentage =
    Math.round(
      (progress /
        REQUIRED_DEVICES) *
        100
    );

  const headline =
    progress === 0
      ? "Build your vault."
      : progress === 1
        ? "Nice start. Keep going."
        : "One more device to go.";

  const description =
    progress === 0
      ? "Add 3 devices to unlock your personalized Home Tech Vault dashboard."
      : progress === 1
        ? "Your first device is organized. Add two more so your dashboard has enough information to become useful."
        : "Add one more device and your full home dashboard will unlock automatically.";

  const buttonLabel =
    progress === 0
      ? "Scan your first device"
      : progress === 1
        ? "Scan device 2"
        : "Add one more device";

  return (
    <div className="mx-auto w-full max-w-[920px] px-1 pb-16 pt-4 sm:pt-6">
      <section className="relative overflow-hidden rounded-[32px] border border-[#17212a]/10 bg-[#f8f5ef] shadow-[0_30px_80px_-55px_rgba(23,33,42,0.55)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#617c43]/10 blur-3xl"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-[#17212a]/5 blur-3xl"
        />

        <div className="relative p-5 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#617c43]/15 bg-[#617c43]/8 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#617c43]">
              <Sparkles
                size={13}
              />
              Build your vault
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#17212a]/8 bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#68737b]">
              <LockKeyhole
                size={13}
              />
              Dashboard locked
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-2xl text-center sm:mt-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#17212a] text-white shadow-[0_18px_40px_-22px_rgba(23,33,42,0.8)]">
              <ShieldCheck
                size={28}
              />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-[#87908c]">
              {firstName}&apos;s Home Tech Vault
            </p>

            <h1 className="mt-3 font-serif text-4xl font-medium leading-[1.02] tracking-[-0.045em] text-[#17212a] sm:text-5xl">
              {headline}
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#69747a] sm:text-[15px]">
              {description}
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#17212a]">
                  {progress} of 3 devices added
                </p>

                <p className="mt-1 text-xs text-[#858e8a]">
                  {remaining === 0
                    ? "Your dashboard is ready."
                    : remaining === 1
                      ? "1 device remaining"
                      : `${remaining} devices remaining`}
                </p>
              </div>

              <p className="text-sm font-semibold text-[#617c43]">
                {percentage}%
              </p>
            </div>

            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#17212a]/7">
              <div
                className="h-full rounded-full bg-[#617c43] transition-all duration-500"
                style={{
                  width:
                    `${percentage}%`,
                }}
              />
            </div>
          </div>

          <div className="mx-auto mt-7 grid max-w-xl grid-cols-3 gap-2.5 sm:gap-3">
            {[0, 1, 2].map(
              (index) => {
                const complete =
                  index <
                  progress;

                const active =
                  index ===
                  progress;

                return (
                  <div
                    key={index}
                    className={
                      complete
                        ? "rounded-2xl border border-[#617c43]/20 bg-[#f0f4eb] p-3 text-center sm:p-4"
                        : active
                          ? "rounded-2xl border border-[#17212a]/15 bg-white p-3 text-center shadow-sm sm:p-4"
                          : "rounded-2xl border border-[#17212a]/7 bg-white/40 p-3 text-center sm:p-4"
                    }
                  >
                    <div
                      className={
                        complete
                          ? "mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#617c43] text-white"
                          : active
                            ? "mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#17212a] text-white"
                            : "mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#17212a]/5 text-[#9ba19e]"
                      }
                    >
                      {complete ? (
                        <Check
                          size={17}
                        />
                      ) : (
                        <span className="text-xs font-bold">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    <p
                      className={
                        complete
                          ? "mt-2 text-[11px] font-semibold text-[#617c43]"
                          : "mt-2 text-[11px] font-semibold text-[#69747a]"
                      }
                    >
                      {complete
                        ? "Added"
                        : index ===
                            progress
                          ? "Next"
                          : "Locked"}
                    </p>
                  </div>
                );
              }
            )}
          </div>

          <div className="mx-auto mt-8 max-w-md">
            <Link
              href="/devices/add?first=1"
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#17212a] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_35px_-22px_rgba(23,33,42,0.75)] transition hover:brightness-110"
            >
              <ScanBarcode
                size={18}
              />

              {buttonLabel}

              <ArrowRight
                size={17}
              />
            </Link>

            <p className="mt-3 text-center text-xs text-[#929997]">
              Smart Scan usually takes only a few seconds.
            </p>
          </div>

          <div className="mx-auto mt-9 max-w-2xl border-t border-[#17212a]/8 pt-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-[#17212a]">
                  Why 3 devices?
                </p>

                <p className="mt-2 text-xs leading-5 text-[#727c81]">
                  Your dashboard is much more useful when Home Tech Vault has a little context about what you own. Three devices gives you something meaningful to see immediately.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#17212a]">
                  Keep it simple.
                </p>

                <p className="mt-2 text-xs leading-5 text-[#727c81]">
                  You do not need receipts, serial numbers, warranties, or every detail right now. Scan the device, save it, and keep moving.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
