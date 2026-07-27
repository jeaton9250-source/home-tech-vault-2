import { ArrowRight, Check } from "lucide-react";

import HeroVisual from "@/components/landing/public/HeroVisual";
import LandingTrackedLink, {
  LandingScrollLink,
} from "@/components/landing/public/LandingTrackedLink";
import { landingTheme } from "@/components/landing/public/landingTheme";
import { LANDING_ANALYTICS_EVENTS } from "@/lib/marketing/landingAnalytics";
import {
  LANDING_HERO_REASSURANCE,
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type HeroSectionProps = {
  isSignedIn?: boolean;
};

export default function HeroSection({
  isSignedIn = false,
}: HeroSectionProps) {
  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;
  const primaryLabel = isSignedIn
    ? "Open Your Home"
    : "Start Free";

  return (
    <section className={landingTheme.section}>
      <div
        className={`${landingTheme.sectionNarrow} grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16`}
      >
        <div>
          <p className={landingTheme.pill}>
            The operating system for your home&apos;s technology
          </p>

          <h1 className="mt-6 max-w-xl text-4xl font-medium tracking-[-0.045em] text-[#172033] md:text-[3.4rem] md:leading-[1.02]">
            Your home, understood.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-[#667085] md:text-[1.0625rem] md:leading-8">
            Home Tech Vault monitors what is connected, spots
            what needs attention, and helps you take the next
            right step — so your home&apos;s technology finally
            feels under control.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <LandingTrackedLink
              href={primaryHref}
              eventName={LANDING_ANALYTICS_EVENTS.heroStartFree}
              className={landingTheme.btnPrimary}
            >
              {primaryLabel}
              <ArrowRight
                size={16}
                className="ml-2"
                aria-hidden
              />
            </LandingTrackedLink>

            <LandingTrackedLink
              href={MARKETING_ROUTES.demo}
              eventName={
                LANDING_ANALYTICS_EVENTS.heroExploreDemo
              }
              className={landingTheme.btnSecondary}
            >
              Explore Live Demo
            </LandingTrackedLink>

            <LandingScrollLink
              sectionId={LANDING_PUBLIC_SECTION_IDS.homeHealth}
              eventName={
                LANDING_ANALYTICS_EVENTS.heroSeeHowItWorks
              }
              className={landingTheme.btnSecondary}
            >
              See What It Can Do
            </LandingScrollLink>
          </div>

          <ul className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {LANDING_HERO_REASSURANCE.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-[#667085]"
              >
                <Check
                  size={16}
                  className="shrink-0 text-[#3BAF75]"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}
