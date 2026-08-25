"use client";

import Link from "next/link";

type FinalCtaProps = {
  isSignedIn?: boolean;
};

export default function FinalCta({ isSignedIn = false }: FinalCtaProps) {
  return (
    <section className="bg-[#183047] px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9ab879]">
          Start small
        </p>

        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl font-medium leading-[1.05] tracking-[-0.04em] text-[#f5f1e8] sm:text-5xl">
          Your home is worth keeping organized.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#c8d0d5]">
          Start with one appliance, one receipt, or one document. Build your
          Home Tech Vault from there.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3">
          <Link
            href={isSignedIn ? "/dashboard" : "/signup"}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#718d4f] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-[#7f9b5a] hover:shadow-md"
          >
            {isSignedIn ? "Open My Vault" : "Create My Free Vault"}
          </Link>

          {!isSignedIn ? (
            <p className="text-xs text-[#aeb8c1]">
              No credit card required.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
