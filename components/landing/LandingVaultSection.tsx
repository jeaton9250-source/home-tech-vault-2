import LandingScrollReveal from "@/components/landing/LandingScrollReveal";
import { landingVaultCards } from "@/lib/marketing/landingContent";
import { LANDING_SECTION_IDS } from "@/lib/marketing/landingNav";
import {
  landingSectionAnchor,
  landingSectionClass,
} from "@/lib/marketing/landingStyles";
import { cn } from "@/lib/design-system/cn";

function VaultCardIllustration({
  label,
}: {
  label: (typeof landingVaultCards)[number]["label"];
}) {
  const marks = {
    Devices: (
      <div className="absolute bottom-4 left-5 h-10 w-14 rounded-xl border border-black/5 bg-white/70 shadow-sm" />
    ),
    Network: (
      <div className="absolute left-1/2 top-5 h-12 w-12 -translate-x-1/2 rounded-full border border-black/5 bg-white/70" />
    ),
    Documents: (
      <div className="absolute left-5 top-5 h-16 w-12 rounded-lg border border-black/5 bg-white/70 shadow-sm" />
    ),
    Receipts: (
      <div className="absolute bottom-5 right-5 h-12 w-16 rounded-lg border border-black/5 bg-white/70 shadow-sm" />
    ),
    Manuals: (
      <div className="absolute left-6 top-6 h-14 w-11 rounded-md border border-black/5 bg-white/70" />
    ),
    Maintenance: (
      <div className="absolute bottom-5 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full border border-black/5 bg-white/70" />
    ),
    Subscriptions: (
      <div className="absolute right-5 top-5 h-10 w-10 rounded-2xl border border-black/5 bg-white/70" />
    ),
    Warranties: (
      <div className="absolute left-5 top-6 h-12 w-16 rounded-2xl border border-black/5 bg-white/70 shadow-sm" />
    ),
  } as const;

  return (
    <div
      className="relative mb-5 aspect-[16/10] overflow-hidden rounded-[1rem] border border-white/50 bg-white/25"
      aria-hidden
    >
      {marks[label]}
    </div>
  );
}

export default function LandingVaultSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.vault}
      className={cn(
        landingSectionClass,
        landingSectionAnchor,
        "border-y border-border-subtle/70 bg-surface-sunken/30 px-8 py-16 md:py-20 lg:px-10"
      )}
    >
      <div className="mx-auto max-w-6xl">
        <LandingScrollReveal className="max-w-2xl">
          <p className="text-overline text-text-muted">
            One place
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-text-primary md:text-4xl">
            Everything in one place.
          </h2>
          <p className="mt-4 text-sm leading-7 text-text-muted">
            Everything your home remembers — organized beautifully,
            ready whenever you need it.
          </p>
        </LandingScrollReveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {landingVaultCards.map((card, index) => (
            <LandingScrollReveal
              key={card.label}
              delayMs={index * 50}
            >
              <article
                className={cn(
                  "htv-card-interactive h-full rounded-[1.15rem] border border-border-subtle/70 bg-surface-card p-5 shadow-[var(--shadow-sm)]",
                  `bg-gradient-to-br ${card.wash}`
                )}
              >
                <VaultCardIllustration label={card.label} />
                <h3 className="text-lg font-medium tracking-[-0.02em] text-text-primary">
                  {card.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-muted">
                  {card.detail}
                </p>
              </article>
            </LandingScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
