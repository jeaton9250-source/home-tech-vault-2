import {
  FileText,
  Laptop,
  Shield,
} from "lucide-react";

import { MarketingContent } from "@/components/marketing/MarketingLayout";
import PageCard from "@/components/ui/PageCard";
import { LANDING_SECTION_IDS } from "@/lib/marketing/landingNav";
import {
  landingCardClass,
  landingMotionRise,
  landingSectionAnchor,
  landingSectionClass,
} from "@/lib/marketing/landingStyles";
import { cn } from "@/lib/design-system/cn";

const benefits = [
  {
    title: "Every Device",
    copy: "Store computers, TVs, routers, cameras, smart home devices, and more.",
    icon: Laptop,
  },
  {
    title: "Every Document",
    copy: "Receipts, manuals, serial numbers, warranties, and purchase information.",
    icon: FileText,
  },
  {
    title: "Everything Protected",
    copy: "Keep everything organized in one secure place and share access with trusted household members.",
    icon: Shield,
  },
] as const;

export default function LandingBenefitsSection() {
  return (
    <MarketingContent
      id={LANDING_SECTION_IDS.features}
      className={cn(
        landingSectionClass,
        landingSectionAnchor
      )}
    >
      <div className="max-w-2xl">
        <h2 className="text-section-title text-text-primary">
          Features
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          One calm place for the technology and paperwork
          that keep your home running.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {benefits.map((benefit, index) => (
          <PageCard
            key={benefit.title}
            elevated={false}
            interactive
            className={cn(
              landingCardClass,
              landingMotionRise,
              index === 1 && "htv-landing-delay-1",
              index === 2 && "htv-landing-delay-2",
              "p-7 md:p-8"
            )}
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken text-text-primary">
              <benefit.icon
                size={20}
                strokeWidth={1.75}
                aria-hidden
              />
            </span>

            <h3 className="text-card-title mt-5 text-text-primary">
              {benefit.title}
            </h3>

            <p className="mt-2.5 text-sm leading-6 text-text-muted">
              {benefit.copy}
            </p>
          </PageCard>
        ))}
      </div>
    </MarketingContent>
  );
}
