import LandingConnectorDownloads from "@/components/landing/LandingConnectorDownloads";
import LandingConnectorFlowIllustration from "@/components/landing/LandingConnectorFlowIllustration";
import LandingScrollReveal from "@/components/landing/LandingScrollReveal";
import { landingConnectorCategories } from "@/lib/marketing/landingContent";
import { LANDING_SECTION_IDS } from "@/lib/marketing/landingNav";
import {
  landingSectionAnchor,
  landingSectionClass,
} from "@/lib/marketing/landingStyles";
import { cn } from "@/lib/design-system/cn";

type LandingSmartConnectorSectionProps = {
  isSignedIn: boolean;
};

export default function LandingSmartConnectorSection({
  isSignedIn,
}: LandingSmartConnectorSectionProps) {
  return (
    <section
      id={LANDING_SECTION_IDS.smartConnector}
      className={cn(
        landingSectionClass,
        landingSectionAnchor,
        "px-8 py-16 md:py-20 lg:px-10"
      )}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <LandingScrollReveal>
            <LandingConnectorFlowIllustration />
          </LandingScrollReveal>

          <LandingScrollReveal delayMs={80}>
            <p className="text-overline text-section-network">
              Smart Connector
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-text-primary md:text-4xl">
              Meet the Smart Connector
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-text-muted">
              Install it once. Connect it to your Home Tech Vault. It
              quietly helps keep your home&apos;s technology up to date.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-text-secondary">
              Know what&apos;s connected — without complicated networking
              or guesswork.
            </p>

            <div className="mt-8">
              <LandingConnectorDownloads
                isSignedIn={isSignedIn}
                showDemoPreview={!isSignedIn}
              />
            </div>
          </LandingScrollReveal>
        </div>

        <LandingScrollReveal
          className="mt-16"
          delayMs={120}
        >
          <p className="text-sm font-medium text-text-primary">
            Works with the technology already in your home
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {landingConnectorCategories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-border-subtle/80 bg-surface-card px-4 py-2 text-sm text-text-secondary transition-colors duration-200 hover:border-border-strong hover:text-text-primary"
              >
                {category}
              </span>
            ))}
          </div>
        </LandingScrollReveal>
      </div>
    </section>
  );
}
