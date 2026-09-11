"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  Home,
  Receipt,
  Router,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
  Wrench,
} from "lucide-react";
import { motion } from "framer-motion";

import InteractiveVaultDemo from "@/components/marketing/InteractiveVaultDemo";
import HomeTechHealthCheckSection from "@/components/landing/public/HomeTechHealthCheckSection";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type PremiumHomeExperienceProps = {
  isSignedIn: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;

const floatingCards = [
  {
    eyebrow: "Warranty",
    title: "Coverage until Mar 2027",
    detail: "Samsung QN90D",
    icon: ShieldCheck,
  },
  {
    eyebrow: "Manual",
    title: "Ready when you need it",
    detail: "Model QN90D",
    icon: FileText,
  },
  {
    eyebrow: "Receipt",
    title: "$1,499.99",
    detail: "Purchased Mar 14",
    icon: Receipt,
  },
];

const recordFeatures = [
  {
    icon: Receipt,
    eyebrow: "Receipts",
    title: "Proof of purchase stays with the product.",
    copy:
      "No digging through years of email when something breaks or needs warranty service.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Warranties",
    title: "Know what is covered before you need it.",
    copy:
      "Coverage dates and supporting documents live beside the device they protect.",
  },
  {
    icon: FileText,
    eyebrow: "Manuals",
    title: "Stop searching for the same manual twice.",
    copy:
      "Keep instructions and useful documentation attached to the correct model.",
  },
  {
    icon: Wrench,
    eyebrow: "Maintenance",
    title: "Your home remembers what happened before.",
    copy:
      "Keep service dates, notes and history together so nothing starts from zero.",
  },
];

export default function PremiumHomeExperience({
  isSignedIn,
}: PremiumHomeExperienceProps) {
  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;

  const primaryLabel = isSignedIn
    ? "Open My Vault"
    : "Start My Home Vault";

  return (
    <>
      {/* ==================================================== */}
      {/* HERO */}
      {/* ==================================================== */}

      <section className="relative overflow-hidden bg-[#f5f1e8]">
        <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[720px] w-[1000px] -translate-x-1/2 rounded-full bg-white/60 blur-[120px]" />

        <div className="relative mx-auto max-w-[1440px] px-5 pb-20 pt-20 md:px-8 md:pb-28 md:pt-28 lg:px-12 lg:pb-32">
          <div className="grid items-center gap-14 lg:grid-cols-[0.87fr_1.13fr] lg:gap-20">
            {/* COPY */}
            <motion.div
              initial={{
                opacity: 0,
                y: 24,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                ease,
              }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#17212a]/10 bg-white/70 px-4 py-2 shadow-[0_8px_30px_-20px_rgba(23,33,42,0.35)] backdrop-blur">
                <Home
                  size={14}
                  className="text-[#617c43]"
                />

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#617c43]">
                  The operating system for your home
                </span>
              </div>

              <h1 className="mt-8 max-w-[700px] font-serif text-[clamp(52px,6vw,92px)] font-medium leading-[0.93] tracking-[-0.06em] text-[#17212a]">
                Your home has{" "}
                <span className="text-[#617c43]">
                  a lot to remember.
                </span>
              </h1>

              <p className="mx-auto mt-7 max-w-[600px] text-[18px] leading-8 text-[#69736e] lg:mx-0 lg:text-[19px]">
                Keep your devices, receipts,
                warranties, manuals, maintenance
                history and Home Wi-Fi organized in
                one beautiful place.
              </p>

              <div className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link
                  href={primaryHref}
                  className="group inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-[#183047] px-8 text-[15px] font-semibold text-white shadow-[0_22px_50px_-28px_rgba(24,48,71,0.9)] transition duration-300 hover:-translate-y-1 hover:bg-[#223f59] hover:shadow-[0_28px_60px_-30px_rgba(24,48,71,0.9)]"
                >
                  {primaryLabel}

                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href={MARKETING_ROUTES.demo}
                  className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-[#17212a]/10 bg-white/65 px-8 text-[15px] font-semibold text-[#17212a] backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white"
                >
                  Explore the Demo
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-[#818a85] lg:justify-start">
                <span>Free to start</span>
                <span>•</span>
                <span>No credit card</span>
                <span>•</span>
                <span>Built for homeowners</span>
              </div>
            </motion.div>

            {/* PRODUCT */}
            <motion.div
              initial={{
                opacity: 0,
                y: 40,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                duration: 1,
                delay: 0.12,
                ease,
              }}
              className="relative"
            >
              <div className="pointer-events-none absolute -inset-10 rounded-[80px] bg-[#617c43]/10 blur-3xl" />

              <motion.div
                whileHover={{
                  y: -8,
                }}
                transition={{
                  duration: 0.4,
                  ease,
                }}
                className="relative"
              >
                <InteractiveVaultDemo />
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-[1280px] px-5 pb-10 md:px-8 lg:px-12">
          <div className="h-px bg-gradient-to-r from-transparent via-[#17212a]/10 to-transparent" />
        </div>
      </section>

      {/* ==================================================== */}
      {/* FLOATING PROOF */}
      {/* ==================================================== */}

      <section className="relative bg-[#f5f1e8] px-5 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto max-w-[850px] text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#617c43]">
              Everything stays connected
            </p>

            <h2 className="mt-5 font-serif text-4xl font-medium leading-[1.02] tracking-[-0.045em] text-[#17212a] sm:text-5xl lg:text-6xl">
              The important details shouldn&apos;t
              live in five different places.
            </h2>

            <p className="mx-auto mt-6 max-w-[690px] text-lg leading-8 text-[#747d78]">
              One device. One record. Everything
              you&apos;ll need later.
            </p>
          </div>

          <div className="relative mx-auto mt-16 max-w-[950px]">
            <motion.div
              whileHover={{
                y: -8,
                scale: 1.01,
              }}
              transition={{
                duration: 0.4,
                ease,
              }}
              className="relative rounded-[36px] border border-[#17212a]/8 bg-[#fffdf8] p-6 shadow-[0_35px_90px_-55px_rgba(23,33,42,0.5)] md:p-9"
            >
              <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
                    Living Room
                  </p>

                  <h3 className="mt-3 font-serif text-4xl tracking-[-0.035em] text-[#17212a]">
                    Samsung QN90D
                  </h3>

                  <p className="mt-2 text-sm text-[#7d8681]">
                    Television · Demo Home
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43]">
                  <Home size={20} />
                </div>
              </div>

              <div className="mt-9 grid gap-4 sm:grid-cols-2">
                <DeviceField
                  label="Model"
                  value="QN90D"
                />

                <DeviceField
                  label="Purchased"
                  value="Mar 14, 2026"
                />

                <DeviceField
                  label="Location"
                  value="Living Room"
                />

                <DeviceField
                  label="Status"
                  value="Organized"
                />
              </div>
            </motion.div>

            {/* FLOATING CARDS */}
            <div className="mt-6 grid gap-4 md:grid-cols-3 lg:mt-[-20px] lg:px-12">
              {floatingCards.map(
                ({
                  eyebrow,
                  title,
                  detail,
                  icon: Icon,
                },
                index) => (
                  <motion.div
                    key={eyebrow}
                    initial={{
                      opacity: 0,
                      y: 24,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.4,
                    }}
                    transition={{
                      duration: 0.55,
                      delay: index * 0.08,
                      ease,
                    }}
                    whileHover={{
                      y: -12,
                      scale: 1.025,
                    }}
                    className="cursor-default rounded-[26px] border border-[#17212a]/8 bg-white/90 p-5 shadow-[0_26px_55px_-38px_rgba(23,33,42,0.4)] backdrop-blur-xl"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2e7] text-[#617c43]">
                      <Icon size={17} />
                    </div>

                    <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.17em] text-[#718d4f]">
                      {eyebrow}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#183047]">
                      {title}
                    </p>

                    <p className="mt-1 text-xs text-[#89928d]">
                      {detail}
                    </p>
                  </motion.div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* TRANSITION */}
      {/* ==================================================== */}

      <section className="relative overflow-hidden bg-[#183047] px-5 py-28 text-white md:px-8 md:py-36 lg:px-12">
        <div className="pointer-events-none absolute left-[-150px] top-[-100px] h-[500px] w-[500px] rounded-full bg-[#718d4f]/10 blur-[100px]" />

        <div className="relative mx-auto max-w-[1100px] text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b8cc9f]">
            Your home should have a memory
          </p>

          <h2 className="mx-auto mt-6 max-w-[900px] font-serif text-5xl font-medium leading-[1] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            So when something happens,
            you&apos;re already ready.
          </h2>

          <p className="mx-auto mt-7 max-w-[650px] text-lg leading-8 text-white/55">
            You should not have to rebuild the
            history of your home every time
            something breaks, expires or needs
            service.
          </p>
        </div>
      </section>

      {/* ==================================================== */}
      {/* FEATURE FLOW */}
      {/* ==================================================== */}

      <section className="bg-[#fffdf8] px-5 py-24 md:px-8 md:py-32 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-5 md:grid-cols-2">
            {recordFeatures.map(
              ({
                icon: Icon,
                eyebrow,
                title,
                copy,
              },
              index) => (
                <motion.article
                  key={eyebrow}
                  initial={{
                    opacity: 0,
                    y: 28,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.3,
                  }}
                  transition={{
                    duration: 0.65,
                    delay: index * 0.06,
                    ease,
                  }}
                  whileHover={{
                    y: -10,
                  }}
                  className="group relative overflow-hidden rounded-[32px] border border-[#17212a]/8 bg-[#f8f5ef] p-7 shadow-[0_22px_60px_-50px_rgba(23,33,42,0.4)] transition-shadow duration-500 hover:shadow-[0_35px_80px_-48px_rgba(23,33,42,0.5)] md:p-9"
                >
                  <div className="pointer-events-none absolute right-[-70px] top-[-70px] h-[180px] w-[180px] rounded-full bg-[#718d4f]/5 blur-3xl transition duration-500 group-hover:bg-[#718d4f]/10" />

                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43] transition duration-300 group-hover:-translate-y-1">
                      <Icon size={20} />
                    </div>

                    <p className="mt-8 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
                      {eyebrow}
                    </p>

                    <h3 className="mt-3 max-w-[450px] font-serif text-3xl leading-[1.05] tracking-[-0.035em] text-[#17212a]">
                      {title}
                    </h3>

                    <p className="mt-5 max-w-[470px] text-[15px] leading-7 text-[#737d78]">
                      {copy}
                    </p>
                  </div>
                </motion.article>
              )
            )}
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* CONNECTOR */}
      {/* ==================================================== */}

      <section className="bg-[#f5f1e8] px-5 py-24 md:px-8 md:py-32 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-16 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#edf2e7] px-4 py-2 text-[#617c43]">
                <Wifi size={14} />

                <span className="text-[9px] font-semibold uppercase tracking-[0.18em]">
                  Home Wi-Fi
                </span>
              </div>

              <h2 className="mt-7 max-w-[580px] font-serif text-5xl font-medium leading-[1.01] tracking-[-0.045em] text-[#17212a]">
                Your network can help build your
                Vault.
              </h2>

              <p className="mt-6 max-w-[570px] text-lg leading-8 text-[#737c77]">
                Home Tech Vault can help discover
                devices already connected to your
                home, making setup dramatically
                easier.
              </p>

              <div className="mt-8 space-y-3">
                <FeatureLine text="Manual discovery included on Free" />
                <FeatureLine text="One Connector included on Free" />
                <FeatureLine text="Choose which devices you want to save" />
                <FeatureLine text="Automatic monitoring available with upgraded plans" />
              </div>
            </div>

            <motion.div
              whileHover={{
                y: -10,
              }}
              transition={{
                duration: 0.4,
                ease,
              }}
              className="rounded-[36px] bg-[#183047] p-5 shadow-[0_40px_90px_-50px_rgba(24,48,71,0.7)] md:p-7"
            >
              <div className="rounded-[28px] bg-[#fffdf8] p-6 md:p-7">
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#718d4f]">
                      Network discovery
                    </p>

                    <h3 className="mt-3 font-serif text-3xl text-[#17212a]">
                      12 devices found.
                    </h3>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43]">
                    <Router size={20} />
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <DiscoveredDevice
                    title="Spectrum WiFi 6E Router"
                    detail="Router · Identified"
                  />

                  <DiscoveredDevice
                    title="Samsung QN90D"
                    detail="Living Room · Television"
                  />

                  <DiscoveredDevice
                    title="MacBook Air"
                    detail="Home Office · Computer"
                  />

                  <DiscoveredDevice
                    title="Ring Doorbell"
                    detail="Front Door · Smart Home"
                  />
                </div>

                <div className="mt-6 rounded-[20px] bg-[#edf2e7] p-5">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      size={15}
                      className="text-[#617c43]"
                    />

                    <span className="text-xs font-semibold text-[#50643b]">
                      Review. Confirm. Save.
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#6e786b]">
                    Home Tech Vault helps identify
                    what is on your network. You stay
                    in control of what enters your
                    Vault.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* HEALTH CHECK */}
      {/* ==================================================== */}

      <div className="bg-[#fffdf8]">
        <HomeTechHealthCheckSection />
      </div>

      {/* ==================================================== */}
      {/* FINAL */}
      {/* ==================================================== */}

      <section className="relative overflow-hidden bg-[#183047] px-5 py-28 text-white md:px-8 md:py-36 lg:px-12">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#718d4f]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-[900px] text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Home size={22} />
          </div>

          <h2 className="mx-auto mt-8 max-w-[800px] font-serif text-5xl font-medium leading-[1] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Give your home a memory.
          </h2>

          <p className="mx-auto mt-7 max-w-[600px] text-lg leading-8 text-white/55">
            Start with one device. One receipt.
            One warranty. Your Vault grows with
            your home.
          </p>

          <Link
            href={primaryHref}
            className="group mt-10 inline-flex min-h-[58px] items-center gap-2 rounded-full bg-[#718d4f] px-9 text-[15px] font-semibold text-white shadow-[0_28px_60px_-30px_rgba(113,141,79,0.8)] transition duration-300 hover:-translate-y-1 hover:bg-[#809c5d]"
          >
            {primaryLabel}

            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          <p className="mt-5 text-xs text-white/35">
            Free to start. No credit card required.
          </p>
        </div>
      </section>
    </>
  );
}

function DeviceField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] bg-[#f5f1e8] px-4 py-4">
      <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#8a938e]">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-[#183047]">
        {value}
      </p>
    </div>
  );
}

function FeatureLine({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#718d4f]/10 text-[#617c43]">
        <Check size={12} />
      </div>

      <span className="text-sm leading-6 text-[#69736e]">
        {text}
      </span>
    </div>
  );
}

function DiscoveredDevice({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <motion.div
      whileHover={{
        x: 5,
      }}
      transition={{
        duration: 0.25,
      }}
      className="flex items-center gap-3 rounded-[17px] border border-[#17212a]/8 bg-white px-4 py-3"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf2e7] text-[#617c43]">
        <Router size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#183047]">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-[#8a938e]">
          {detail}
        </p>
      </div>

      <Check
        size={15}
        className="text-[#718d4f]"
      />
    </motion.div>
  );
}
