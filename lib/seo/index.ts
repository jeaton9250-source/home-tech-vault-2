export {
  createSeoMetadata,
  type SeoPageInput,
} from "@/lib/seo/metadata";

export { createPageMetadata } from "@/lib/marketing/metadata";

export {
  serializeJsonLd,
  createOrganizationJsonLd,
  createSoftwareApplicationJsonLd,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createWebPageJsonLd,
  createArticleJsonLd,
  createProductJsonLd,
  createDefaultPageJsonLd,
  type JsonLdObject,
  type BreadcrumbJsonLdItem,
  type FaqJsonLdItem,
  type SoftwareApplicationJsonLdOptions,
  type ProductJsonLdOptions,
} from "@/lib/seo/jsonLd";

export {
  SEO_LANDING_PAGES,
  SEO_LANDING_SLUGS,
  getSeoLandingPage,
  breadcrumbsForLanding,
  type SeoLandingPageContent,
} from "@/lib/seo/landingPages";

export {
  getAllProgrammaticGuides,
  getProgrammaticGuide,
  programmaticGuideSitemapEntries,
  SEO_BRANDS,
  type ProgrammaticGuidePage,
} from "@/lib/seo/programmatic";

export {
  getAllComparisonPages,
  getComparisonPage,
  comparisonSitemapEntries,
  type ComparisonPage,
} from "@/lib/seo/comparisons/pages";

export {
  getAllSeoFaqs,
  getSeoFaq,
  seoFaqSitemapEntries,
  seoFaqPath,
  type SeoFaqEntry,
} from "@/lib/seo/faqs/catalog";

export {
  CORE_INTERNAL_LINKS,
  buildPageInternalLinks,
  type CoreInternalLink,
} from "@/lib/seo/internalLinks";

export { auditInternalLinks } from "@/lib/seo/linkAudit";
