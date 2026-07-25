import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";

import MarketingLayout, {
  MarketingContent,
  MarketingPageHero,
} from "@/components/marketing/MarketingLayout";
import {
  Breadcrumb,
  CallToAction,
  CoreSiteLinks,
  Faq,
  FeatureHighlights,
  SEOLayout,
} from "@/components/seo";
import { cn } from "@/lib/design-system/cn";
import {
  breadcrumbsForLanding,
  type SeoLandingPageContent,
  type SeoLandingScreenshot,
} from "@/lib/seo/landingPages";

type SEOLandingPageProps = {
  page: SeoLandingPageContent;
};

function ScreenshotCard({
  title,
  caption,
  src,
  alt,
  wide,
}: SeoLandingScreenshot) {
  return (
    <figure
      className={cn(
        "overflow-hidden border border-border-subtle bg-surface-card",
        wide && "md:col-span-3"
      )}
    >
      <div
        className={cn(
          "relative",
          wide ? "aspect-[21/9] sm:aspect-[24/9]" : "aspect-[16/10]",
          !src &&
            "flex flex-col items-center justify-center gap-3 bg-[linear-gradient(160deg,var(--color-surface-raised)_0%,var(--color-surface-card)_55%,#EEF3F7_100%)]"
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt ?? title}
            fill
            sizes={
              wide
                ? "(max-width: 768px) 100vw, 1120px"
                : "(max-width: 768px) 100vw, 33vw"
            }
            className={cn(
              wide ? "object-contain object-center bg-surface-raised" : "object-cover object-top"
            )}
          />
        ) : (
          <>
            <ImageIcon
              size={28}
              className="text-text-muted"
              aria-hidden
            />
            <span className="px-4 text-center text-sm font-medium text-text-muted">
              Screenshot placeholder
            </span>
          </>
        )}
      </div>
      <figcaption className="border-t border-border-subtle px-4 py-3">
        <p className="text-sm font-medium text-text-primary">
          {title}
        </p>
        <p className="mt-1 text-sm leading-6 text-text-muted">
          {caption}
        </p>
      </figcaption>
    </figure>
  );
}

/**
 * Shared template for SEO landing pages.
 * Content stays unique via `SeoLandingPageContent`.
 */
export default function SEOLandingPage({
  page,
}: SEOLandingPageProps) {
  const breadcrumbs = breadcrumbsForLanding(page);

  return (
    <MarketingLayout>
      <SEOLayout
        title={page.metaTitle}
        description={page.metaDescription}
        path={page.path}
        breadcrumbs={breadcrumbs}
        showBreadcrumbs={false}
        includeSoftwareApplication
        faqItems={page.faqItems}
      >
        <MarketingPageHero
          eyebrow={page.heroEyebrow}
          title={page.heroTitle}
          description={page.heroDescription}
        >
          <div className="mt-4">
            <Breadcrumb items={breadcrumbs} />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={page.heroPrimaryHref}
              className="htv-focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-charcoal px-6 py-2.5 text-sm font-medium text-surface-card transition hover:bg-charcoal-hover"
            >
              {page.heroPrimaryLabel}
              <ArrowRight size={16} aria-hidden />
            </Link>

            <Link
              href={page.heroSecondaryHref}
              className="htv-focus-ring inline-flex min-h-11 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-6 py-2.5 text-sm font-medium text-text-primary transition hover:bg-surface-raised"
            >
              {page.heroSecondaryLabel}
            </Link>
          </div>
        </MarketingPageHero>

        <MarketingContent className="space-y-20 md:space-y-24">
          <section>
            <h2 className="text-2xl font-medium tracking-[-0.03em] text-text-primary md:text-3xl">
              {page.benefitsTitle}
            </h2>

            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {page.benefits.map((benefit) => (
                <li
                  key={benefit.title}
                  className="border border-border-subtle bg-surface-card p-5"
                >
                  <h3 className="text-base font-medium text-text-primary">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-text-muted">
                    {benefit.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium tracking-[-0.03em] text-text-primary md:text-3xl">
              {page.screenshotsTitle}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {page.screenshots.map((shot) => (
                <ScreenshotCard key={shot.title} {...shot} />
              ))}
            </div>
          </section>

          <FeatureHighlights
            title={page.featuresTitle}
            description={page.featuresDescription}
            features={page.features}
          />

          <Faq
            title={page.faqTitle}
            description={page.faqDescription}
            items={page.faqItems}
            includeJsonLd={false}
          />

          <CoreSiteLinks
            currentPath={page.path}
            related={page.related.map((item) => ({
              href: item.href,
              label: item.title,
              description: item.description,
            }))}
          />

          <CallToAction
            title={page.ctaTitle}
            description={page.ctaDescription}
            primaryLabel={page.heroPrimaryLabel}
            primaryHref={page.heroPrimaryHref}
            secondaryLabel="Explore features"
            secondaryHref="/features"
          />
        </MarketingContent>
      </SEOLayout>
    </MarketingLayout>
  );
}
