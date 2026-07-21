import {
  FileText,
  Laptop,
  Shield,
} from "lucide-react";

import { MarketingContent } from "@/components/marketing/MarketingLayout";
import PageCard from "@/components/ui/PageCard";
import {
  landingCardClass,
  landingMotionRise,
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
    <MarketingContent className={landingSectionClass}>
      <div className="grid gap-5 md:grid-cols-3">
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

            <h2 className="text-card-title mt-5 text-text-primary">
              {benefit.title}
            </h2>

            <p className="mt-2.5 text-sm leading-6 text-text-muted">
              {benefit.copy}
            </p>
          </PageCard>
        ))}
      </div>
    </MarketingContent>
  );
}
