"use client";

import Link from "next/link";
import {
  ArrowRight,
  Home,
} from "lucide-react";

import InteractiveVaultDemo from "@/components/marketing/InteractiveVaultDemo";
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
    <section className="overflow-hidden bg-[#f5f1e8] px-5 py-16 md:px-8 md:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto w-full max-w-[1380px]">
        <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 xl:gap-20">
          {/* HERO COPY — LEFT */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#17212a]/10 bg-[#fffdf8] px-4 py-2 shadow-sm">
              <Home
                size={14}
                className="text-[#617c43]"
              />

              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
                A simpler way to remember your home
              </span>
            </div>

            <h1
              className="mt-7 font-serif font-medium leading-[0.98] tracking-[-0.055em] text-[#17212a]"
              style={{
                fontSize:
                  "clamp(48px, 5vw, 76px)",
              }}
            >
              Your home comes with{" "}
              <span className="text-[#617c43]">
                a lot to remember.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-8 text-[#68716c] lg:mx-0">
              Keep the receipts, warranties,
              manuals, appliances, maintenance
              records, and important details
              you&apos;ll want later in one simple
              place.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href={primaryHref}
                className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-[#617c43] px-8 text-[15px] font-semibold text-white shadow-[0_18px_38px_-22px_rgba(97,124,67,0.9)] transition hover:-translate-y-0.5 hover:bg-[#718d4f]"
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

            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[#7b847f] lg:justify-start">
              <span>Free to start</span>
              <span>•</span>
              <span>No credit card required</span>
              <span>•</span>
              <span>Built for homeowners</span>
            </div>
          </div>

          {/* INTERACTIVE DEMO — RIGHT */}
          <div>
            <div className="mb-5 flex items-center justify-center gap-2 lg:justify-start">
              <span className="h-2 w-2 rounded-full bg-[#617c43]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#617c43]">
                Try Home Tech Vault
              </span>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-12 rounded-full bg-[#617c43]/10 blur-3xl" />

              <div className="relative">
                <InteractiveVaultDemo />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
