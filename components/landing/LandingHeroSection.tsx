import {
  ArrowRight,
  Download,
  LayoutGrid,
  Play,
  Radar,
  ScanSearch,
} from "lucide-react";

import {
  LandingConnectorDemoSummary,
} from "@/components/landing/LandingConnectorIllustrations";
import Button from "@/components/ui/Button";
import {
  landingMotionRise,
  landingSectionClass,
  marketingSecondaryButtonClass,
} from "@/lib/marketing/landingStyles";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

type LandingHeroSectionProps = {
  isSignedIn: boolean;
};

export default function LandingHeroSection({
  isSignedIn,
}: LandingHeroSectionProps) {
  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;
  const primaryLabel = isSignedIn
    ? "Go to Your Vault"
    : "Start Free";

  return (
    <section
      className={cn(
        "px-8 lg:px-10",
        landingSectionClass,
        "pt-12 md:pt-16"
      )}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className={landingMotionRise}>
          <p className="inline-flex items-center gap-2 text-overline text-section-network">
            <Radar size={14} aria-hidden />
            Smart Connector
          </p>

          <h1 className="mt-5 max-w-xl text-4xl font-medium tracking-[-0.04em] text-text-primary md:text-[3.25rem] md:leading-[1.04]">
            Automatically discover, organize, and monitor your home
            technology.
          </h1>

          <p className="mt-5 max-w-lg text-[0.9375rem] leading-7 text-text-muted">
            Home Tech Vault pairs a private local connector with your
            digital vault — so devices, warranties, receipts, and network
            status stay organized without spreadsheets or guesswork.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href={primaryHref} size="lg">
              {primaryLabel}
              <ArrowRight size={16} aria-hidden />
            </Button>

            <Button
              href={MARKETING_ROUTES.demo}
              variant="secondary"
              size="lg"
              className={marketingSecondaryButtonClass}
            >
              <Play size={16} aria-hidden />
              Watch Demo
            </Button>
          </div>
        </div>

        <div
          className={cn(
            landingMotionRise,
            "htv-landing-delay-1"
          )}
        >
          <LandingConnectorDemoSummary />
        </div>
      </div>
    </section>
  );
}

export function LandingHowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Download",
      copy: "Install the Smart Connector on macOS or Windows and pair it to your vault.",
      icon: Download,
    },
    {
      step: "02",
      title: "Scan",
      copy: "Passive local discovery finds devices using ARP, mDNS, and SSDP — no aggressive port scans.",
      icon: ScanSearch,
    },
    {
      step: "03",
      title: "Organize",
      copy: "Review matches, confirm identities, and keep everything linked in one secure vault.",
      icon: LayoutGrid,
    },
  ] as const;

  return (
    <section
      id="how-it-works"
      className={cn(
        "scroll-mt-32 md:scroll-mt-36",
        "border-y border-border-subtle/80 bg-surface-sunken/35 px-8 py-14 md:py-16 lg:px-10"
      )}
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-overline text-text-muted">
            How It Works
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-text-primary md:text-4xl">
            From download to organized home in three steps.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {steps.map((item, index) => (
            <article
              key={item.title}
              className={cn(
                "rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-7 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:shadow-md md:p-8",
                landingMotionRise,
                index === 1 && "htv-landing-delay-1",
                index === 2 && "htv-landing-delay-2"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken text-section-network">
                  <item.icon size={22} aria-hidden />
                </span>
                <span className="text-sm font-medium tabular-nums text-text-tertiary">
                  {item.step}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-medium tracking-[-0.02em] text-text-primary">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-text-muted">
                {item.copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
