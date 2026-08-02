import { ArrowRight, Play } from "lucide-react";

import LandingTrackedLink from "@/components/landing/public/LandingTrackedLink";
import { landingTheme } from "@/components/landing/public/landingTheme";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type FinalCtaProps = {
  isSignedIn?: boolean;
};

export default function FinalCta({ isSignedIn = false }: FinalCtaProps) {
  const primaryHref = isSignedIn ? "/dashboard" : MARKETING_ROUTES.signup;
  const primaryLabel = isSignedIn ? "Open My Vault" : "Start Free";

  return (
    <section className="bg-surface-base px-5 py-20 md:px-8 lg:px-12">
      <div className={landingTheme.sectionNarrow}>
        <div className="overflow-hidden rounded-[36px] bg-charcoal px-7 py-12 text-white shadow-lift md:px-12 md:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
                Stop searching through drawers and inboxes
              </p>
              <h2 className="mt-4 max-w-3xl text-3xl font-medium tracking-[-0.035em] md:text-5xl">
                Build the home inventory you will actually use.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
                Start free, organize your first devices, and keep the warranty
                information you will need later in one dependable place.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <LandingTrackedLink
                href={primaryHref}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-charcoal transition hover:bg-white/90"
              >
                {primaryLabel}
                <ArrowRight size={16} className="ml-2" aria-hidden />
              </LandingTrackedLink>
              <LandingTrackedLink
                href={MARKETING_ROUTES.demo}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                <Play size={15} className="mr-2" aria-hidden />
                Explore Demo
              </LandingTrackedLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
