import type { ReactNode } from "react";

import { cn } from "@/lib/design-system/cn";

export type FeatureHighlight = {
  title: string;
  description: string;
  icon?: ReactNode;
};

type FeatureHighlightsProps = {
  features: ReadonlyArray<FeatureHighlight>;
  title?: string;
  description?: string;
  className?: string;
};

/**
 * Compact feature highlight grid for SEO/content pages.
 */
export default function FeatureHighlights({
  features,
  title,
  description,
  className,
}: FeatureHighlightsProps) {
  if (features.length === 0) {
    return null;
  }

  return (
    <section className={cn("w-full", className)}>
      {title ? (
        <h2 className="text-2xl font-medium tracking-[-0.03em] text-text-primary md:text-3xl">
          {title}
        </h2>
      ) : null}

      {description ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-7 text-text-muted",
            title && "mt-3"
          )}
        >
          {description}
        </p>
      ) : null}

      <ul
        className={cn(
          "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
          (title || description) && "mt-8"
        )}
      >
        {features.map((feature) => (
          <li
            key={feature.title}
            className="border border-border-subtle bg-surface-card p-5"
          >
            {feature.icon ? (
              <div className="mb-3 text-text-primary">
                {feature.icon}
              </div>
            ) : null}

            <h3 className="text-base font-medium text-text-primary">
              {feature.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-text-muted">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
