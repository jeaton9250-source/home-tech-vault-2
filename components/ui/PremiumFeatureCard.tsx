import type { ReactNode } from "react";

import { Sparkles } from "lucide-react";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/design-system/cn";

type PremiumFeatureCardProps = {
  title: string;
  description: string;
  planLabel?: string;
  upgradeHref?: string;
  upgradeLabel?: string;
  features?: string[];
  className?: string;
  children?: ReactNode;
};

export default function PremiumFeatureCard({
  title,
  description,
  planLabel = "Premium",
  upgradeHref = "/upgrade",
  upgradeLabel = "Upgrade",
  features = [],
  className,
  children,
}: PremiumFeatureCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface-card shadow-sm",
        className
      )}
    >
      <div className="border-b border-border-subtle bg-gradient-to-br from-premium-soft to-surface-card px-6 py-8 md:px-8">
        <Badge variant="premium">
          {planLabel}
        </Badge>

        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-premium text-white shadow-sm">
            <Sparkles size={22} />
          </div>

          <div>
            <h2 className="text-section-title text-text-primary">
              {title}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-6 md:p-8">
        {features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-sm text-text-primary"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-premium" />
                {feature}
              </li>
            ))}
          </ul>
        )}

        {children}

        {upgradeHref && upgradeLabel && (
          <Button
            href={upgradeHref}
            variant="premium"
            className="w-full justify-center sm:w-auto"
          >
            {upgradeLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
