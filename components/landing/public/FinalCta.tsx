import Link from "next/link";
import { ArrowRight } from "lucide-react";

import LandingTrackedLink from "@/components/landing/public/LandingTrackedLink";
import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_ANALYTICS_EVENTS,
} from "@/lib/marketing/landingAnalytics";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

type FinalCtaProps = {
  isSignedIn?: boolean;
};

export default function FinalCta({
  isSignedIn = false,
}: FinalCtaProps) {
  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;
  const primaryLabel = isSignedIn
    ? "Go to Your Vault"
    : "Start Organizing Free";

  return (
    <section className="px-5 py-16 md:px-8 md:py-24 lg:px-10">
      <div className={landingTheme.sectionNarrow}>
        <div
          className={cn(
            landingTheme.card,
            "overflow-hidden bg-[radial-gradient(circle_at_20%_0%,#EAF8F0_0%,#FFFFFF_42%,#EDF3F7_100%)] px-8 py-14 text-center md:px-16 md:py-16"
          )}
        >
          <h2 className="mx-auto max-w-3xl text-3xl font-medium tracking-[-0.03em] text-[#172033] md:text-[2.35rem] md:leading-tight">
            Your home deserves better than drawers,
            folders, and sticky notes.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#667085]">
            Give every device, document, warranty, and
            maintenance record a place you can actually
            find.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <LandingTrackedLink
              href={primaryHref}
              eventName={
                LANDING_ANALYTICS_EVENTS.finalCta
              }
              className={landingTheme.btnPrimary}
            >
              {primaryLabel}
              <ArrowRight
                size={16}
                className="ml-2"
                aria-hidden
              />
            </LandingTrackedLink>

            {!isSignedIn ? (
              <Link
                href={MARKETING_ROUTES.login}
                className={landingTheme.link}
              >
                Sign In
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
