import LandingScrollReveal from "@/components/landing/LandingScrollReveal";
import { landingMemoryMoments } from "@/lib/marketing/landingContent";
import { LANDING_SECTION_IDS } from "@/lib/marketing/landingNav";
import {
  landingSectionAnchor,
  landingSectionClass,
} from "@/lib/marketing/landingStyles";
import { cn } from "@/lib/design-system/cn";

const toneClasses = {
  success: "border-home-health-muted/70 bg-home-health-soft/60 text-home-health",
  info: "border-interaction/15 bg-interaction-soft/70 text-interaction",
  warning: "border-warning/20 bg-warning-soft/70 text-warning",
} as const;

export default function LandingMemoriesSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.memories}
      className={cn(
        landingSectionClass,
        landingSectionAnchor,
        "px-8 py-16 md:py-20 lg:px-10"
      )}
    >
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <LandingScrollReveal>
          <p className="text-overline text-section-network">
            Quiet reminders
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-text-primary md:text-4xl">
            Life gets busy.
            <span className="block text-text-secondary">
              We remember the little things.
            </span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-text-muted">
            Your Home Tech Vault doesn&apos;t. Gentle updates keep you
            informed — never overwhelmed.
          </p>
        </LandingScrollReveal>

        <div className="grid gap-3 sm:grid-cols-2">
          {landingMemoryMoments.map((moment, index) => (
            <LandingScrollReveal
              key={moment.text}
              delayMs={index * 60}
            >
              <article
                className={cn(
                  "htv-card-interactive rounded-[1.15rem] border px-5 py-4 text-sm leading-6 shadow-[var(--shadow-sm)]",
                  toneClasses[moment.tone]
                )}
              >
                {moment.text}
              </article>
            </LandingScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
