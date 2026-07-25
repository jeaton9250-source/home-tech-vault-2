import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/design-system/cn";

export type BreadcrumbItem = {
  name: string;
  href?: string;
};

type BreadcrumbProps = {
  items: ReadonlyArray<BreadcrumbItem>;
  className?: string;
  /** Visually hide while keeping markup for a11y / progressive enhancement */
  visuallyHidden?: boolean;
};

/**
 * Accessible breadcrumb navigation. Pair with BreadcrumbList JSON-LD via SEOLayout.
 */
export default function Breadcrumb({
  items,
  className,
  visuallyHidden = false,
}: BreadcrumbProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        visuallyHidden && "sr-only",
        className
      )}
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.name}-${index}`}
              className="inline-flex items-center gap-1.5"
            >
              {index > 0 ? (
                <ChevronRight
                  size={14}
                  className="shrink-0 text-text-muted/70"
                  aria-hidden
                />
              ) : null}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="htv-focus-ring rounded-sm transition hover:text-text-primary"
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    isLast && "font-medium text-text-primary"
                  )}
                >
                  {item.name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
