import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/design-system/cn";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type CallToActionProps = {
  title: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
};

/**
 * Reusable marketing CTA block. Uses existing design-system tokens.
 */
export default function CallToAction({
  title,
  description,
  primaryLabel = "Start free",
  primaryHref = MARKETING_ROUTES.signup,
  secondaryLabel = "See pricing",
  secondaryHref = MARKETING_ROUTES.pricing,
  className,
}: CallToActionProps) {
  return (
    <section
      className={cn(
        "border border-border-subtle bg-surface-raised px-6 py-12 text-center md:px-10 md:py-16",
        className
      )}
    >
      <h2 className="mx-auto max-w-2xl text-2xl font-medium tracking-[-0.03em] text-text-primary md:text-3xl">
        {title}
      </h2>

      {description ? (
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-text-muted">
          {description}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href={primaryHref}
          className="htv-focus-ring inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] bg-charcoal px-5 py-3 text-sm font-medium text-surface-card transition hover:opacity-90"
        >
          {primaryLabel}
          <ArrowRight size={16} aria-hidden />
        </Link>

        {secondaryLabel && secondaryHref ? (
          <Link
            href={secondaryHref}
            className="htv-focus-ring inline-flex items-center justify-center rounded-[var(--radius-control)] border border-border-subtle bg-surface-card px-5 py-3 text-sm font-medium text-text-primary transition hover:bg-surface-raised"
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
