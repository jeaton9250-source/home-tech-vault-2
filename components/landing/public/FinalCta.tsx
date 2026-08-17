"use client";

import Link from "next/link";

import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type FinalCtaProps = {
  isSignedIn?: boolean;
};

export default function FinalCta({
  isSignedIn = false,
}: FinalCtaProps) {
  const href = isSignedIn
    ? "/imports"
    : MARKETING_ROUTES.signup;

  return (
    <section className="bg-surface-card px-5 pb-24 pt-8 md:px-8 md:pb-32 lg:px-12">
      <div className="mx-auto max-w-[var(--content-max)] overflow-hidden rounded-[32px] bg-charcoal px-6 py-14 text-center text-white sm:px-10 md:py-20">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
          <Sparkles
            size={21}
            aria-hidden
          />
        </div>

        <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
          Your next receipt could be
          your first Vault entry.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
          Create your Home Tech Vault,
          forward one purchase confirmation,
          and see how easy it can be to
          start organizing your home
          technology.
        </p>

        <Link
          href={href}
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-semibold text-charcoal transition hover:opacity-90"
        >
          {isSignedIn
            ? "Open Smart Import"
            : "Create My Free Vault"}

          <ArrowRight
            size={17}
            aria-hidden
          />
        </Link>

        {!isSignedIn && (
          <p className="mt-4 text-xs text-white/50">
            No credit card required.
          </p>
        )}
      </div>
    </section>
  );
}