"use client";

import type { ReactNode } from "react";

import Link from "next/link";

import {
  ArrowRight,
  Check,
  FileText,
  Home,
  LockKeyhole,
  Receipt,
  Router,
  Search,
  ShieldCheck,
  Sparkles,
  Wifi,
  Wrench,
} from "lucide-react";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import HomeTechHealthCheckSection from "@/components/landing/public/HomeTechHealthCheckSection";
import InteractiveVaultDemo from "@/components/marketing/InteractiveVaultDemo";

import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type Props = {
  isSignedIn: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;

export default function CinematicHomeExperience({ isSignedIn }: Props) {
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();

  const ambientY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, 260],
  );

  const primaryHref = isSignedIn ? "/dashboard" : MARKETING_ROUTES.signup;

  const primaryLabel = isSignedIn ? "Open My Vault" : "Start My Home Vault";

  return (
    <>
      {/* ================================================== */}
      {/* HERO */}
      {/* ================================================== */}

      <section className="relative isolate overflow-hidden bg-[#f6f2ea]">
        <motion.div
          style={{
            y: ambientY,
          }}
          className="pointer-events-none absolute left-1/2 top-[-420px] -z-10 h-[980px] w-[1280px] -translate-x-1/2 rounded-full bg-white/80 blur-[150px]"
        />

        <div className="pointer-events-none absolute right-[-220px] top-[240px] -z-10 h-[520px] w-[520px] rounded-full bg-[#718d4f]/8 blur-[100px]" />

        <div className="mx-auto max-w-[1480px] px-5 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28 lg:px-12 lg:pb-36">
          <div className="grid items-center gap-16 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20 xl:gap-24">
            {/* HERO COPY */}
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: reduceMotion ? 0 : 0.85,
                ease,
              }}
              className="text-center lg:text-left"
            >
              <Eyebrow>
                <Home size={13} />
                The digital memory of your home
              </Eyebrow>

              <h1 className="mx-auto mt-8 max-w-[720px] font-serif text-[clamp(54px,6.2vw,96px)] font-medium leading-[0.91] tracking-[-0.065em] text-[#17212a] lg:mx-0">
                Your home,
                <br />
                <span className="text-[#617c43]">remembered.</span>
              </h1>

              <p className="mx-auto mt-8 max-w-[600px] text-[18px] leading-[1.75] text-[#707a75] lg:mx-0 lg:text-[19px]">
                Every appliance. Every warranty. Every receipt. Every manual.
                Every service date. Keep the useful history of your home
                connected and ready when you need it.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
                <PrimaryLink href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight size={16} />
                </PrimaryLink>

                <SecondaryLink href={MARKETING_ROUTES.demo}>
                  Explore a Home
                </SecondaryLink>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[12px] text-[#89918d] lg:justify-start">
                <span>Free to start</span>

                <span>•</span>

                <span>No credit card</span>

                <span>•</span>

                <span>8 devices included</span>
              </div>
            </motion.div>

            {/* PRODUCT EXPERIENCE */}
            <motion.div
              initial={{
                opacity: 0,
                y: 40,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                duration: reduceMotion ? 0 : 1,
                delay: reduceMotion ? 0 : 0.12,
                ease,
              }}
              className="relative"
            >
              <div className="pointer-events-none absolute -inset-12 rounded-[90px] bg-[#718d4f]/10 blur-[80px]" />

              <motion.div
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        y: -8,
                      }
                }
                transition={{
                  duration: 0.4,
                  ease,
                }}
                className="relative"
              >
                <InteractiveVaultDemo />
              </motion.div>

              <FloatingInfoCard
                className="absolute -left-32 top-[4%] hidden 2xl:block scale-90 origin-top-right"
                icon={ShieldCheck}
                eyebrow="Warranty"
                title="Coverage active"
                detail="Through Mar 2027"
              />

              <FloatingInfoCard
                className="absolute -right-28 bottom-[2%] hidden 2xl:block scale-90 origin-bottom-left"
                icon={FileText}
                eyebrow="Manual"
                title="Ready to open"
                detail="Samsung QN90D"
              />
            </motion.div>
          </div>
        </div>

        <FlowDivider />
      </section>

      {/* ================================================== */}
      {/* TRUST / VALUE STRIP */}
      {/* ================================================== */}

      <section className="border-y border-[#17212a]/8 bg-[#fffdf8] px-5 py-6 md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1180px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TrustItem>Free to start</TrustItem>

          <TrustItem>Built around your home</TrustItem>

          <TrustItem>Private household record</TrustItem>

          <TrustItem>Grows with your home</TrustItem>
        </div>
      </section>

      {/* ================================================== */}
      {/* BIG BRAND IDEA */}
      {/* ================================================== */}

      <section className="bg-[#fffdf8] px-5 py-28 md:px-8 md:py-40 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#718d4f]">
              A home creates a lifetime of details
            </p>

            <h2 className="mx-auto mt-6 max-w-[1020px] text-center font-serif text-[clamp(48px,6vw,82px)] font-medium leading-[0.97] tracking-[-0.055em] text-[#17212a]">
              Your house creates thousands of details.
              <br />
              You shouldn&apos;t have to remember them.
            </h2>

            <p className="mx-auto mt-8 max-w-[680px] text-center text-lg leading-8 text-[#747e79]">
              The model number behind the refrigerator. The receipt buried in
              your inbox. The warranty you forgot was active. The service date
              nobody wrote down. Home Tech Vault gives those details one place
              to live.
            </p>
          </Reveal>

          <div className="mt-20 grid gap-5 md:grid-cols-3">
            <MomentCard
              icon={Wrench}
              eyebrow="Something breaks"
              title="The answer should already be there."
              copy="Model number, receipt, warranty, manual and history stay connected to the thing they belong to."
            />

            <MomentCard
              icon={ShieldCheck}
              eyebrow="Something needs service"
              title="Let your home build a history."
              copy="Service dates, maintenance notes and supporting records stay connected over time."
            />

            <MomentCard
              icon={Home}
              eyebrow="Someday you move"
              title="Pass on the home, not the guesswork."
              copy="Keep the useful history organized so the next chapter does not have to start from scratch."
            />
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* STICKY PRODUCT STORY */}
      {/* ================================================== */}

      <section className="bg-[#f2eee5] px-5 py-28 md:px-8 md:py-40 lg:px-12">
        <div className="mx-auto max-w-[1220px]">
          <div className="grid gap-16 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            {/* STICKY COPY */}
            <div>
              <div className="lg:sticky lg:top-28">
                <Reveal>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#617c43]">
                    One thing. Everything around it.
                  </p>

                  <h2 className="mt-6 max-w-[550px] font-serif text-[clamp(44px,5vw,68px)] font-medium leading-[0.98] tracking-[-0.05em] text-[#17212a]">
                    Don&apos;t just store what you own.
                    <br />
                    Remember its story.
                  </h2>

                  <p className="mt-7 max-w-[540px] text-lg leading-8 text-[#737d78]">
                    A useful home record connects the product to its purchase,
                    protection, documents, service history and the details you
                    will need later.
                  </p>

                  <div className="mt-9 space-y-3">
                    <CheckLine>Purchase information</CheckLine>

                    <CheckLine>Warranty coverage</CheckLine>

                    <CheckLine>Manuals and documents</CheckLine>

                    <CheckLine>Maintenance history</CheckLine>
                  </div>
                </Reveal>
              </div>
            </div>

            {/* PRODUCT STACK */}
            <div className="space-y-8">
              <DeviceRecord />

              <FloatingRecord
                icon={Receipt}
                eyebrow="Purchase receipt"
                title="Saved and ready"
                copy="Proof of purchase stays beside the product it belongs to."
              />

              <FloatingRecord
                icon={ShieldCheck}
                eyebrow="Warranty"
                title="Active through Mar 2027"
                copy="Coverage dates are visible before you actually need them."
              />

              <FloatingRecord
                icon={FileText}
                eyebrow="Product manual"
                title="Found for your model"
                copy="The correct instructions are already connected to the correct device."
              />

              <FloatingRecord
                icon={Wrench}
                eyebrow="Maintenance"
                title="Last service: May 18"
                copy="Keep a useful history instead of relying on memory."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* CINEMATIC RESET */}
      {/* ================================================== */}

      <section className="relative isolate overflow-hidden bg-[#183047] px-5 py-36 text-white md:px-8 md:py-48 lg:px-12">
        <div className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[600px] w-[600px] rounded-full bg-[#718d4f]/10 blur-[120px]" />

        <div className="pointer-events-none absolute -bottom-80 -right-32 -z-10 h-[700px] w-[700px] rounded-full bg-white/5 blur-[120px]" />

        <Reveal>
          <div className="mx-auto max-w-[980px] text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b5ca9c]">
              Home Tech Vault
            </p>

            <h2 className="mt-7 font-serif text-[clamp(54px,7vw,94px)] font-medium leading-[0.92] tracking-[-0.06em]">
              Your home knows
              <br />
              more than you think.
            </h2>

            <p className="mx-auto mt-8 max-w-[650px] text-lg leading-8 text-white/55">
              Home Tech Vault turns scattered household information into
              something far more useful: a living record you can search,
              understand and build on over time.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ================================================== */}
      {/* CONNECTED HOME */}
      {/* ================================================== */}

      <section className="bg-[#fffdf8] px-5 py-28 md:px-8 md:py-40 lg:px-12">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-16 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            {/* COPY */}
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#edf2e7] px-4 py-2 text-[#617c43]">
                  <Wifi size={14} />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">
                    Home Wi-Fi
                  </span>
                </div>

                <h2 className="mt-7 max-w-[590px] font-serif text-[clamp(44px,5vw,70px)] font-medium leading-[0.99] tracking-[-0.05em] text-[#17212a]">
                  Your home can help build its own memory.
                </h2>

                <p className="mt-7 max-w-[560px] text-lg leading-8 text-[#747e79]">
                  Home Wi-Fi discovery helps identify technology already living
                  on your network, reducing setup work and helping your Vault
                  take shape faster.
                </p>

                <div className="mt-9 space-y-3">
                  <CheckLine>Manual discovery included on Free</CheckLine>

                  <CheckLine>One Connector included on Free</CheckLine>

                  <CheckLine>You choose what gets saved</CheckLine>

                  <CheckLine>Automatic monitoring on upgraded plans</CheckLine>
                </div>

                <Link
                  href="/network"
                  className="group mt-9 inline-flex items-center gap-2 text-sm font-semibold text-[#183047]"
                >
                  Explore Home Wi-Fi
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </Reveal>

            {/* DISCOVERY CARD */}
            <motion.div
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      y: -10,
                    }
              }
              transition={{
                duration: 0.45,
                ease,
              }}
              className="rounded-[42px] bg-[#183047] p-4 shadow-[0_45px_100px_-56px_rgba(24,48,71,0.75)] md:p-6"
            >
              <div className="rounded-[32px] bg-[#f6f2ea] p-6 md:p-8">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.19em] text-[#718d4f]">
                      Home discovery
                    </p>

                    <h3 className="mt-3 font-serif text-3xl tracking-[-0.04em] text-[#17212a]">
                      12 devices found.
                    </h3>

                    <p className="mt-2 text-sm text-[#848d88]">
                      Ready for your review
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7eddf] text-[#617c43]">
                    <Router size={20} />
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <DeviceRow
                    title="Spectrum WiFi 6E Router"
                    detail="Router · Identified"
                  />

                  <DeviceRow
                    title="Samsung QN90D"
                    detail="Television · Living Room"
                  />

                  <DeviceRow
                    title="MacBook Air"
                    detail="Computer · Home Office"
                  />

                  <DeviceRow
                    title="Ring Doorbell"
                    detail="Smart Home · Front Door"
                  />
                </div>

                <div className="mt-6 rounded-[20px] bg-[#e8eedf] p-5">
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-[#617c43]" />

                    <p className="text-xs font-semibold text-[#4f633b]">
                      Found. Reviewed. Remembered.
                    </p>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#6d7769]">
                    Home Tech Vault can help identify what is on your network.
                    You stay in control of what enters your Vault.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* PRIVACY / TRUST */}
      {/* ================================================== */}

      <section className="bg-[#f2eee5] px-5 py-24 md:px-8 md:py-32 lg:px-12">
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <div className="rounded-[38px] border border-[#17212a]/8 bg-[#fffdf8] p-7 shadow-[0_35px_90px_-60px_rgba(23,33,42,0.4)] md:p-10">
              <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#183047] text-white">
                  <LockKeyhole size={24} />
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#718d4f]">
                    Your home. Your memory.
                  </p>

                  <h2 className="mt-3 max-w-[760px] font-serif text-3xl tracking-[-0.04em] text-[#17212a] sm:text-4xl">
                    Your home&apos;s record should stay under your control.
                  </h2>

                  <p className="mt-4 max-w-[760px] text-[15px] leading-7 text-[#737d78]">
                    Home Tech Vault keeps household records together while
                    letting you decide what belongs in your Vault and who gets
                    access to it.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================== */}
      {/* HEALTH CHECK */}
      {/* ================================================== */}

      <div className="relative bg-[#f5f1e8]">
        <FlowDivider />

        <HomeTechHealthCheckSection />
      </div>

      {/* ================================================== */}
      {/* FINAL CTA */}
      {/* ================================================== */}

      <section className="relative isolate overflow-hidden bg-[#f5f1e8] px-5 pb-32 pt-28 md:px-8 md:pb-44 md:pt-36 lg:px-12">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[700px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/75 blur-[120px]" />

        <Reveal>
          <div className="mx-auto max-w-[900px] text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#17212a]/8 bg-white/70 text-[#617c43] shadow-sm backdrop-blur-xl">
              <Home size={22} />
            </div>

            <h2 className="mt-8 font-serif text-[clamp(54px,7vw,92px)] font-medium leading-[0.93] tracking-[-0.06em] text-[#17212a]">
              Give your home
              <br />
              <span className="text-[#617c43]">a memory.</span>
            </h2>

            <p className="mx-auto mt-8 max-w-[620px] text-lg leading-8 text-[#747e79]">
              Start with one device. One receipt. One warranty. Your Vault grows
              naturally with your home.
            </p>

            <PrimaryLink href={primaryHref} className="mt-10">
              {primaryLabel}
              <ArrowRight size={16} />
            </PrimaryLink>

            <p className="mt-5 text-xs text-[#949b97]">
              Free to start · No credit card required
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}

/* ====================================================== */
/* SMALL COMPONENTS */
/* ====================================================== */

function Reveal({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: reduceMotion ? 0 : 34,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.18,
      }}
      transition={{
        duration: reduceMotion ? 0 : 0.75,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#183047]/10 bg-white/70 px-4 py-2 text-[#617c43] shadow-[0_10px_40px_-26px_rgba(24,48,71,0.35)] backdrop-blur-xl">
      <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em]">
        {children}
      </span>
    </div>
  );
}

function PrimaryLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "group inline-flex min-h-[58px] items-center justify-center gap-2 rounded-full bg-[#183047] px-9 text-[15px] font-semibold text-white shadow-[0_26px_60px_-34px_rgba(24,48,71,0.9)] transition duration-300 hover:-translate-y-1 hover:bg-[#223f59]",
        className,
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[58px] items-center justify-center rounded-full border border-[#17212a]/10 bg-white/70 px-9 text-[15px] font-semibold text-[#17212a] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white"
    >
      {children}
    </Link>
  );
}

function FlowDivider() {
  return (
    <div className="relative mx-auto h-14 max-w-[1220px]">
      <div className="absolute left-1/2 top-1/2 h-px w-[90%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#17212a]/10 to-transparent" />

      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#718d4f]/25 bg-[#f5f1e8]" />
    </div>
  );
}

function TrustItem({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2 text-center text-sm font-medium text-[#68726d]">
      <Check size={14} className="shrink-0 text-[#718d4f]" />

      {children}
    </div>
  );
}

function FloatingInfoCard({
  className,
  icon: Icon,
  eyebrow,
  title,
  detail,
}: {
  className?: string;
  icon: typeof Home;
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -12,
        scale: 1.025,
      }}
      transition={{
        duration: 0.35,
        ease,
      }}
      className={[
        "z-20 w-[220px] rounded-[24px] border border-[#17212a]/8 bg-white/90 p-5 shadow-[0_30px_65px_-40px_rgba(23,33,42,0.45)] backdrop-blur-xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf2e7] text-[#617c43]">
        <Icon size={16} />
      </div>

      <p className="mt-4 text-[8px] font-semibold uppercase tracking-[0.17em] text-[#718d4f]">
        {eyebrow}
      </p>

      <p className="mt-1 text-sm font-semibold text-[#183047]">{title}</p>

      <p className="mt-1 text-xs text-[#8b938f]">{detail}</p>
    </motion.div>
  );
}

function MomentCard({
  icon: Icon,
  eyebrow,
  title,
  copy,
}: {
  icon: typeof Home;
  eyebrow: string;
  title: string;
  copy: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -12,
            }
      }
      transition={{
        duration: 0.4,
        ease,
      }}
      className="group rounded-[32px] border border-[#17212a]/8 bg-[#f8f5ef] p-7 shadow-[0_28px_70px_-58px_rgba(23,33,42,0.35)] transition-shadow duration-500 hover:shadow-[0_38px_85px_-55px_rgba(23,33,42,0.48)] md:p-8"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43] transition-transform duration-300 group-hover:-translate-y-1">
        <Icon size={19} />
      </div>

      <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#7f8983]">
        {eyebrow}
      </p>

      <h3 className="mt-3 font-serif text-2xl leading-[1.1] tracking-[-0.03em] text-[#17212a]">
        {title}
      </h3>

      <p className="mt-4 text-[15px] leading-7 text-[#747e79]">{copy}</p>
    </motion.article>
  );
}

function DeviceRecord() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -8,
            }
      }
      transition={{
        duration: 0.4,
        ease,
      }}
      className="rounded-[38px] border border-[#17212a]/8 bg-[#fffdf8] p-7 shadow-[0_38px_100px_-60px_rgba(23,33,42,0.5)] md:p-10"
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
            Living Room
          </p>

          <h3 className="mt-3 font-serif text-4xl tracking-[-0.04em] text-[#17212a]">
            Samsung QN90D
          </h3>

          <p className="mt-2 text-sm text-[#87908b]">Television · Demo Home</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43]">
          <Home size={21} />
        </div>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <RecordCell label="Model" value="QN90D" />

        <RecordCell label="Purchased" value="Mar 14, 2026" />

        <RecordCell label="Warranty" value="Active" />

        <RecordCell label="Location" value="Living Room" />
      </div>
    </motion.div>
  );
}

function RecordCell({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      className="rounded-[18px] bg-[#f2eee5] px-5 py-4"
    >
      <p className="text-[8px] font-semibold uppercase tracking-[0.17em] text-[#89928d]">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-[#183047]">{value}</p>
    </motion.div>
  );
}

function FloatingRecord({
  icon: Icon,
  eyebrow,
  title,
  copy,
}: {
  icon: typeof Home;
  eyebrow: string;
  title: string;
  copy: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: reduceMotion ? 0 : 28,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -10,
            }
      }
      transition={{
        duration: 0.55,
        ease,
      }}
      className="rounded-[28px] border border-[#17212a]/8 bg-white/90 p-6 shadow-[0_30px_70px_-52px_rgba(23,33,42,0.45)] backdrop-blur-xl md:p-7"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43]">
          <Icon size={18} />
        </div>

        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
            {eyebrow}
          </p>

          <p className="mt-2 text-base font-semibold text-[#183047]">{title}</p>

          <p className="mt-2 text-sm leading-6 text-[#7a847f]">{copy}</p>
        </div>
      </div>
    </motion.div>
  );
}

function CheckLine({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#718d4f]/10 text-[#617c43]">
        <Check size={12} />
      </div>

      <span className="text-sm leading-6 text-[#68736d]">{children}</span>
    </div>
  );
}

function DeviceRow({ title, detail }: { title: string; detail: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={
        reduceMotion
          ? undefined
          : {
              x: 6,
              y: -2,
            }
      }
      transition={{
        duration: 0.25,
      }}
      className="flex items-center gap-3 rounded-[18px] border border-[#17212a]/8 bg-white px-4 py-3"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf2e7] text-[#617c43]">
        <Router size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#183047]">{title}</p>

        <p className="mt-0.5 text-xs text-[#89928d]">{detail}</p>
      </div>

      <Check size={15} className="text-[#718d4f]" />
    </motion.div>
  );
}
