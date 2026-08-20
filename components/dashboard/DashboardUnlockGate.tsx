"use client";

import Link from "next/link";

import {
  ArrowRight,
  Check,
  FileText,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type DashboardUnlockGateProps = {
  deviceCount: number;

  /*
   * Keep this component compatible with any
   * additional props already being passed by
   * HomeHealthDashboard.
   */
  [key: string]: unknown;
};

const REQUIRED_DEVICES = 3;

export default function DashboardUnlockGate({
  deviceCount,
}: DashboardUnlockGateProps) {
  const safeDeviceCount = Math.min(
    Math.max(deviceCount, 0),
    REQUIRED_DEVICES
  );

  const remaining =
    Math.max(
      REQUIRED_DEVICES -
        safeDeviceCount,
      0
    );

  const percentage =
    Math.round(
      (safeDeviceCount /
        REQUIRED_DEVICES) *
        100
    );

  const title =
    remaining === 1
      ? "One more device unlocks your full Vault."
      : remaining === 2
        ? "Two more devices unlock your full Vault."
        : "Build the foundation of your Home Tech Vault.";

  const description =
    remaining === 1
      ? "You're almost there. Add one more piece of technology and Home Tech Vault can turn your starter inventory into a useful home dashboard."
      : "Add the technology you rely on most. Three real devices gives your Vault enough context to become much more useful.";

  const buttonLabel =
    remaining === 1
      ? "Add my final device"
      : safeDeviceCount === 0
        ? "Add my first device"
        : "Add my next device";

  return (
    <div
      className="
        mx-auto w-full max-w-[1100px]
        pb-16 pt-3
      "
    >
      <section
        className="
          relative overflow-hidden
          rounded-[32px]
          border border-[#17212a]/10
          bg-[#0d1925]
          px-5 py-8
          text-white
          shadow-[0_30px_80px_-50px_rgba(11,22,35,0.85)]
          sm:px-8 sm:py-10
          lg:px-12 lg:py-12
        "
      >
        {/* Ambient premium glow */}
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
              -right-24 -top-28
              h-[360px] w-[360px]
              rounded-full
              bg-[#718d4f]/16
              blur-[90px]
            "
          />

          <div
            className="
              absolute
              -bottom-36 -left-20
              h-[320px] w-[320px]
              rounded-full
              bg-[#a4b987]/8
              blur-[100px]
            "
          />
        </div>

        <div className="relative">
          {/* Small status */}
          <div
            className="
              flex flex-wrap
              items-center
              justify-between
              gap-3
            "
          >
            <div
              className="
                inline-flex
                items-center gap-2
                rounded-full
                border border-[#9db77c]/20
                bg-[#718d4f]/10
                px-3.5 py-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-[#b8ca9f]
              "
            >
              <Sparkles
                size={13}
                aria-hidden
              />

              Starter Vault
            </div>

            <div
              className="
                inline-flex
                items-center gap-2
                text-xs
                font-medium
                text-white/45
              "
            >
              <LockKeyhole
                size={14}
                aria-hidden
              />

              Full dashboard unlocks at 3
            </div>
          </div>

          {/* Main message */}
          <div
            className="
              mx-auto
              mt-10
              max-w-[760px]
              text-center
            "
          >
            <div
              className="
                mx-auto
                flex h-14 w-14
                items-center justify-center
                rounded-[20px]
                border border-white/10
                bg-white/[0.055]
                text-[#a9c38a]
                shadow-[0_16px_40px_rgba(0,0,0,0.18)]
              "
            >
              <ShieldCheck
                size={26}
                strokeWidth={1.7}
                aria-hidden
              />
            </div>

            <p
              className="
                mt-7
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-[#9db77c]
              "
            >
              {safeDeviceCount} of 3 devices added
            </p>

            <h1
              className="
                mx-auto
                mt-3
                max-w-[720px]
                font-serif
                text-4xl
                font-medium
                leading-[1.04]
                tracking-[-0.045em]
                text-[#f6f3ec]
                sm:text-5xl
                lg:text-[3.4rem]
              "
            >
              {title}
            </h1>

            <p
              className="
                mx-auto
                mt-5
                max-w-[640px]
                text-sm
                leading-7
                text-white/55
                sm:text-base
              "
            >
              {description}
            </p>
          </div>

          {/* Progress */}
          <div
            className="
              mx-auto
              mt-9
              max-w-[650px]
            "
          >
            <div
              className="
                flex items-end
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-white/35
                  "
                >
                  Vault activation
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-semibold
                    text-white/85
                  "
                >
                  {remaining === 1
                    ? "1 device remaining"
                    : `${remaining} devices remaining`}
                </p>
              </div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-[#abc38b]
                "
              >
                {percentage}%
              </p>
            </div>

            <div
              className="
                mt-4
                h-2
                overflow-hidden
                rounded-full
                bg-white/8
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-[#7f9c5d]
                  transition-all
                  duration-500
                "
                style={{
                  width:
                    `${percentage}%`,
                }}
              />
            </div>

            {/* Three simple device slots */}
            <div
              className="
                mt-5
                grid grid-cols-3
                gap-2.5
              "
            >
              {[0, 1, 2].map(
                (index) => {
                  const complete =
                    index <
                    safeDeviceCount;

                  const next =
                    index ===
                    safeDeviceCount;

                  return (
                    <div
                      key={index}
                      className={`
                        flex
                        min-h-[76px]
                        flex-col
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        px-3 py-3
                        text-center
                        ${
                          complete
                            ? "border-[#8faa69]/20 bg-[#718d4f]/12"
                            : next
                              ? "border-white/16 bg-white/[0.06]"
                              : "border-white/7 bg-white/[0.025]"
                        }
                      `}
                    >
                      <div
                        className={`
                          flex
                          h-7 w-7
                          items-center
                          justify-center
                          rounded-full
                          text-xs
                          font-semibold
                          ${
                            complete
                              ? "bg-[#718d4f] text-white"
                              : next
                                ? "bg-[#f4f0e8] text-[#17212a]"
                                : "bg-white/6 text-white/25"
                          }
                        `}
                      >
                        {complete ? (
                          <Check
                            size={14}
                            strokeWidth={2.5}
                          />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <span
                        className={`
                          mt-2
                          text-[10px]
                          font-medium
                          ${
                            complete
                              ? "text-[#abc38b]"
                              : next
                                ? "text-white/75"
                                : "text-white/25"
                          }
                        `}
                      >
                        {complete
                          ? "Added"
                          : next
                            ? "Next"
                            : "Locked"}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* What unlocks */}
          <div
            className="
              mx-auto
              mt-10
              max-w-[820px]
            "
          >
            <div
              className="
                flex items-center
                justify-center gap-3
              "
            >
              <span
                className="
                  h-px flex-1
                  bg-white/8
                "
              />

              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-white/35
                "
              >
                What you&apos;re unlocking
              </p>

              <span
                className="
                  h-px flex-1
                  bg-white/8
                "
              />
            </div>

            <div
              className="
                mt-5
                grid gap-3
                sm:grid-cols-3
              "
            >
              <UnlockPreview
                icon={Gauge}
                title="Vault readiness"
                description="See how complete and prepared your home technology record is."
              />

              <UnlockPreview
                icon={FileText}
                title="Protection gaps"
                description="Surface missing warranties, receipts, and important device details."
              />

              <UnlockPreview
                icon={Sparkles}
                title="Clear next steps"
                description="Know what deserves attention instead of guessing what to organize next."
              />
            </div>
          </div>

          {/* CTA */}
          <div
            className="
              mx-auto
              mt-9
              max-w-[460px]
              text-center
            "
          >
            <Link
              href="/devices/add?first=1"
              className="
                group
                flex w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-[#f5f1e8]
                px-6 py-4
                text-sm
                font-semibold
                text-[#17212a]
                shadow-[0_16px_40px_rgba(0,0,0,0.22)]
                transition
                duration-200
                hover:-translate-y-0.5
                hover:bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-[#9db77c]
                focus:ring-offset-2
                focus:ring-offset-[#0d1925]
              "
            >
              {buttonLabel}

              <ArrowRight
                size={17}
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-0.5
                "
                aria-hidden
              />
            </Link>

            <p
              className="
                mt-4
                text-xs
                leading-5
                text-white/30
              "
            >
              Add the devices you rely on most
              first. You can complete the details
              later.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

type UnlockPreviewProps = {
  icon: typeof Gauge;
  title: string;
  description: string;
};

function UnlockPreview({
  icon: Icon,
  title,
  description,
}: UnlockPreviewProps) {
  return (
    <article
      className="
        rounded-[22px]
        border border-white/7
        bg-white/[0.035]
        p-4
      "
    >
      <div
        className="
          flex h-9 w-9
          items-center
          justify-center
          rounded-xl
          bg-[#718d4f]/14
          text-[#abc38b]
        "
      >
        <Icon
          size={17}
          strokeWidth={1.8}
          aria-hidden
        />
      </div>

      <h2
        className="
          mt-4
          text-sm
          font-semibold
          text-white/90
        "
      >
        {title}
      </h2>

      <p
        className="
          mt-1.5
          text-xs
          leading-5
          text-white/40
        "
      >
        {description}
      </p>
    </article>
  );
}
