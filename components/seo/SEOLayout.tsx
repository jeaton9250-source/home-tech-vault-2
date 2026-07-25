import type { ReactNode } from "react";

import Breadcrumb, {
  type BreadcrumbItem,
} from "@/components/seo/Breadcrumb";
import StructuredData from "@/components/seo/StructuredData";
import { cn } from "@/lib/design-system/cn";
import { siteConfig } from "@/lib/marketing/site";
import {
  createDefaultPageJsonLd,
  createFaqJsonLd,
  type FaqJsonLdItem,
} from "@/lib/seo/jsonLd";

export type SeoLayoutProps = {
  /** Page title used in JSON-LD WebPage */
  title: string;
  description: string;
  /** Absolute path beginning with `/` */
  path: string;
  /**
   * Breadcrumb trail. Defaults to Home → current title when omitted.
   * Pass an empty array to skip breadcrumb JSON-LD/UI.
   */
  breadcrumbs?: ReadonlyArray<BreadcrumbItem>;
  /** Show visible breadcrumb nav (default true when breadcrumbs exist) */
  showBreadcrumbs?: boolean;
  /** Hide visible crumbs but keep JSON-LD */
  breadcrumbsVisuallyHidden?: boolean;
  /** Include SoftwareApplication JSON-LD (default true) */
  includeSoftwareApplication?: boolean;
  /** Optional FAQ items → FAQPage JSON-LD */
  faqItems?: ReadonlyArray<FaqJsonLdItem>;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

function defaultBreadcrumbs(
  title: string,
  path: string
): BreadcrumbItem[] {
  if (path === "/") {
    return [{ name: siteConfig.name }];
  }

  return [
    { name: "Home", href: "/" },
    { name: title },
  ];
}

/**
 * Reusable SEO page shell for the App Router.
 *
 * Automatically emits:
 * - WebPage JSON-LD
 * - BreadcrumbList JSON-LD
 * - SoftwareApplication JSON-LD (optional)
 * - FAQPage JSON-LD when `faqItems` are provided
 *
 * Pair with `createSeoMetadata()` in the route `metadata` export for
 * title, description, canonical, Open Graph, and Twitter Card tags.
 */
export default function SEOLayout({
  title,
  description,
  path,
  breadcrumbs,
  showBreadcrumbs = true,
  breadcrumbsVisuallyHidden = false,
  includeSoftwareApplication = true,
  faqItems,
  children,
  className,
  contentClassName,
}: SeoLayoutProps) {
  const crumbs =
    breadcrumbs ?? defaultBreadcrumbs(title, path);

  const jsonLd = createDefaultPageJsonLd({
    title,
    description,
    path,
    breadcrumbs: crumbs.map((item) => ({
      name: item.name,
      path: item.href,
    })),
    includeSoftwareApplication,
  });

  return (
    <div className={cn("w-full", className)}>
      <StructuredData
        id={`seo-layout-${path.replace(/\W+/g, "-") || "home"}`}
        data={jsonLd}
      />

      {faqItems && faqItems.length > 0 ? (
        <StructuredData
          id={`seo-faq-${path.replace(/\W+/g, "-") || "home"}`}
          data={createFaqJsonLd(faqItems)}
        />
      ) : null}

      {showBreadcrumbs && crumbs.length > 0 ? (
        <div
          className={cn(
            "mx-auto w-full max-w-6xl px-6 pt-6 md:px-8",
            breadcrumbsVisuallyHidden && "sr-only",
            contentClassName
          )}
        >
          <Breadcrumb
            items={crumbs}
            visuallyHidden={breadcrumbsVisuallyHidden}
          />
        </div>
      ) : null}

      {children}
    </div>
  );
}
