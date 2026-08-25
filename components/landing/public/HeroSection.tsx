"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Home,
  Receipt,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type HeroSectionProps = {
  isSignedIn: boolean;
};

export default function HeroSection({
  isSignedIn,
}: HeroSectionProps) {
  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;

  const primaryLabel = isSignedIn
    ? "Open My Vault"
    : "Start My Home Vault";

  return (
    <section
      className="bg-[#f5f1e8]"
      style={{
        padding: "80px 48px",
      }}
    >
      <div
        style={{
          maxWidth: "1380px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          alignItems: "center",
          gap: "56px",
          width: "100%",
        }}
      >
        {/* LEFT */}
        <div
          style={{
            flex: "0 0 42%",
            width: "42%",
            minWidth: 0,
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#17212a]/10 bg-[#fffdf8] px-4 py-2 shadow-sm">
            <Home size={14} className="text-[#617c43]" />

            <span
              style={{
                fontSize: "11px",
                letterSpacing: "0.16em",
              }}
              className="font-semibold uppercase text-[#617c43]"
            >
              A simpler way to remember your home
            </span>
          </div>

          <h1
            style={{
              marginTop: "28px",
              maxWidth: "620px",
              fontSize: "clamp(52px, 5vw, 78px)",
              lineHeight: "0.98",
              letterSpacing: "-0.055em",
              fontWeight: 500,
            }}
            className="font-serif text-[#17212a]"
          >
            Your home comes with
            <br />
            <span className="text-[#617c43]">
              a lot to remember.
            </span>
          </h1>

          <p
            style={{
              marginTop: "28px",
              maxWidth: "560px",
              fontSize: "18px",
              lineHeight: "1.75",
            }}
            className="text-[#68716c]"
          >
            Keep the receipts, warranties, manuals, appliances,
            maintenance records, and important details you&apos;ll
            want later in one simple place.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={primaryHref}
              className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-[#617c43] px-8 text-[15px] font-semibold text-white shadow-[0_18px_38px_-22px_rgba(97,124,67,0.9)] transition hover:bg-[#718d4f]"
            >
              {primaryLabel}
              <ArrowRight size={16} />
            </Link>

            <Link
              href={MARKETING_ROUTES.demo}
              className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-[#17212a]/15 bg-[#fffdf8]/80 px-8 text-[15px] font-semibold text-[#17212a] transition hover:bg-[#fffdf8]"
            >
              See an Example
            </Link>
          </div>
        </div>

        {/* RIGHT */}
        <div
          style={{
            flex: "1 1 58%",
            width: "58%",
            minWidth: 0,
          }}
        >
          <div className="rounded-[34px] bg-[#e7dfd0] p-3 shadow-[0_35px_90px_-45px_rgba(23,33,42,0.4)]">
            <div
              className="relative overflow-hidden rounded-[27px]"
              style={{
                width: "100%",
                height: "500px",
              }}
            >
              <Image
                src="/images/home-hero.jpg"
                alt="A warm and welcoming home"
                width={1600}
                height={1200}
                priority
                quality={75}
                className="h-full w-full object-cover object-[center_45%]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#17212a]/30 via-transparent to-transparent" />

              {/* TOP RIGHT NOTE */}
              <div className="absolute right-5 top-5 max-w-[220px] rotate-[2deg] rounded-2xl border border-white/40 bg-[#fffdf8]/95 px-4 py-3 shadow-lg backdrop-blur-sm">
                <p className="font-serif text-base leading-6 text-[#40502f]">
                  Because “I know I saved that somewhere” gets old.
                </p>
              </div>

              {/* BOTTOM OVERLAY */}
              <div className="absolute bottom-5 left-1/2 w-[92%] -translate-x-1/2 rounded-[22px] border border-white/30 bg-[#fffdf8]/95 px-5 py-4 shadow-xl backdrop-blur-md">
                <div className="mb-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#617c43]">
                    My Home
                  </p>

                  <p className="mt-1 font-serif text-[22px] text-[#17212a]">
                    The things I&apos;ll want later.
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <HomeRecord
                    icon={Receipt}
                    label="Receipts"
                  />

                  <HomeRecord
                    icon={ShieldCheck}
                    label="Warranties"
                  />

                  <HomeRecord
                    icon={FileText}
                    label="Documents"
                  />

                  <HomeRecord
                    icon={Wrench}
                    label="Maintenance"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 700px) {
          section > div {
            flex-direction: column !important;
          }

          section > div > div {
            width: 100% !important;
            flex: none !important;
          }
        }
      `}</style>
    </section>
  );
}

function HomeRecord({
  icon: Icon,
  label,
}: {
  icon: typeof Home;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl bg-[#f5f1e8] px-3.5 py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#617c43]/10 text-[#617c43]">
        <Icon size={13} />
      </div>

      <span className="text-[11px] font-medium leading-4 text-[#59625d]">
        {label}
      </span>
    </div>
  );
}
