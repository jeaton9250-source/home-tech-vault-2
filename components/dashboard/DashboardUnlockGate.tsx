"use client";

import Link from "next/link";
import {
  ArrowRight,
  PackagePlus,
  Sparkles,
} from "lucide-react";

type DashboardUnlockGateProps = {
  deviceCount: number;
  [key: string]: unknown;
};

export default function DashboardUnlockGate({
  deviceCount,
}: DashboardUnlockGateProps) {
  if (deviceCount > 0) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] pb-16 pt-3">
      <section className="relative overflow-hidden rounded-[32px] border border-[#17212a]/10 bg-[#0d1925] px-5 py-9 text-white shadow-[0_30px_80px_-50px_rgba(11,22,35,0.85)] sm:px-8 sm:py-11 lg:px-12">
        <div className="pointer-events-none absolute -right-24 -top-28 h-[360px] w-[360px] rounded-full bg-[#718d4f]/16 blur-[90px]" />

        <div className="relative mx-auto max-w-[760px] text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#9db77c]/20 bg-[#718d4f]/10 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b8ca9f]">
            <Sparkles size={13} aria-hidden />
            Your first useful record
          </div>

          <div className="mx-auto mt-7 flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.055] text-[#9bb27a]">
            <PackagePlus size={27} strokeWidth={1.7} aria-hidden />
          </div>

          <h1 className="mx-auto mt-6 max-w-[700px] font-serif text-4xl font-medium leading-[1.04] tracking-[-0.045em] text-[#f6f3ec] sm:text-5xl">
            Give your home one thing to remember.
          </h1>

          <p className="mx-auto mt-5 max-w-[620px] text-sm leading-7 text-white/55 sm:text-base">
            Start with a TV, appliance, computer, router, or anything you would
            want details for during a repair, return, or warranty claim. You can
            add the rest later.
          </p>

          <div className="mx-auto mt-8 max-w-[460px]">
            <Link
              href="/devices/add?first=1"
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f5f1e8] px-6 py-4 text-sm font-semibold text-[#17212a] shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#9db77c] focus:ring-offset-2 focus:ring-offset-[#0d1925]"
            >
              Add my first thing
              <ArrowRight
                size={17}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>

            <p className="mt-4 text-xs leading-5 text-white/35">
              Start with a name. Add receipts, warranty details, photos, and
              model information whenever you have them.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
