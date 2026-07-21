import { Check } from "lucide-react";

import { MarketingContent } from "@/components/marketing/MarketingLayout";
import PageCard from "@/components/ui/PageCard";

const trustPoints = [
  "Secure sign-in keeps your account protected",
  "Household permissions control who can view and manage records",
  "HTTPS protects data in transit between your browser and Home Tech Vault",
  "You decide what stays in your vault and who can access it",
] as const;

export default function LandingTrustSection() {
  return (
    <MarketingContent className="py-10 md:py-14">
      <PageCard
        elevated={false}
        className="border-border-subtle bg-surface-sunken/35 p-6 md:p-8"
      >
        <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-10 md:items-start">
          <div>
            <p className="text-overline text-interaction">
              Trust & privacy
            </p>

            <h2 className="text-section-title mt-2 text-text-primary">
              Built to keep your household information safe
            </h2>

            <p className="mt-3 text-sm leading-6 text-text-muted">
              Home Tech Vault is designed for households
              who want calm organization without giving up
              control of their data.
            </p>
          </div>

          <div>
            <ul className="space-y-3">
              {trustPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-sm leading-6 text-text-secondary"
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-interaction-soft text-interaction">
                    <Check
                      size={12}
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <p className="mt-5 border-t border-border-subtle pt-5 text-sm leading-6 text-text-primary">
              Your information belongs to you. Home Tech Vault
              does not sell your personal information.
            </p>
          </div>
        </div>
      </PageCard>
    </MarketingContent>
  );
}
