import { MarketingContent } from "@/components/marketing/MarketingLayout";
import PageCard from "@/components/ui/PageCard";
import {
  landingCardClass,
  landingMotionRise,
  landingSectionClass,
} from "@/lib/marketing/landingStyles";
import { cn } from "@/lib/design-system/cn";

const trustItems = [
  {
    title: "Your account",
    copy: "Sign in with the email address tied to your vault.",
  },
  {
    title: "Your household",
    copy: "Choose who can view and manage shared records.",
  },
  {
    title: "Your connection",
    copy: "HTTPS keeps data encrypted while it travels to and from your browser.",
  },
  {
    title: "Your data",
    copy: "We do not sell your personal information.",
  },
] as const;

export default function LandingTrustSection() {
  return (
    <MarketingContent className={landingSectionClass}>
      <PageCard
        elevated={false}
        className={cn(
          landingCardClass,
          landingMotionRise,
          "border-border-subtle bg-surface-sunken/30 p-7 md:p-10"
        )}
      >
        <div className="max-w-2xl">
          <h2 className="text-section-title text-text-primary">
            Built with privacy in mind.
          </h2>

          <p className="mt-3 text-sm leading-6 text-text-muted md:text-[0.9375rem] md:leading-7">
            Only you control who can access your Home Tech
            Vault.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="rounded-[var(--radius-button)] border border-border-subtle/80 bg-surface-card px-4 py-4"
            >
              <p className="text-sm font-medium text-text-primary">
                {item.title}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-text-muted">
                {item.copy}
              </p>
            </div>
          ))}
        </div>
      </PageCard>
    </MarketingContent>
  );
}
