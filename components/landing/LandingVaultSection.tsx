import {
  FileText,
  Laptop,
  Receipt,
  ShieldCheck,
  Users,
  Wrench,
  Wifi,
} from "lucide-react";

import { LANDING_SECTION_IDS } from "@/lib/marketing/landingNav";
import { landingVaultPillars } from "@/lib/marketing/landingConnectorDemo";
import {
  landingMotionRise,
  landingSectionClass,
  landingSectionAnchor,
} from "@/lib/marketing/landingStyles";
import { cn } from "@/lib/design-system/cn";

const pillarIcons = {
  Devices: Laptop,
  Warranties: ShieldCheck,
  Manuals: FileText,
  Receipts: Receipt,
  Network: Wifi,
  Maintenance: Wrench,
  Family: Users,
} as const;

export default function LandingVaultSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.vault}
      className={cn(
        landingSectionClass,
        landingSectionAnchor,
        "px-8 lg:px-10"
      )}
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-overline text-text-muted">
            Everything in One Place
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-text-primary md:text-4xl">
            Everything your home remembers.
            <span className="block text-text-secondary">
              In one beautiful place.
            </span>
          </h2>
          <p className="mt-4 text-sm leading-7 text-text-muted">
            The product quietly remembers everything about your home&apos;s
            technology — so you don&apos;t have to dig through drawers,
            email, or old boxes when something matters.
          </p>
          <p className="mt-4 text-sm leading-6 text-text-secondary">
            Spend less time searching. Spend more time enjoying your home.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {landingVaultPillars.map((pillar, index) => {
            const Icon =
              pillarIcons[
                pillar.label as keyof typeof pillarIcons
              ] ?? Laptop;

            return (
              <article
                key={pillar.label}
                className={cn(
                  "rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
                  landingMotionRise,
                  index % 3 === 1 && "htv-landing-delay-1",
                  index % 3 === 2 && "htv-landing-delay-2"
                )}
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken text-text-primary">
                  <Icon size={20} strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-medium tracking-[-0.02em] text-text-primary">
                  {pillar.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-muted">
                  {pillar.detail}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
