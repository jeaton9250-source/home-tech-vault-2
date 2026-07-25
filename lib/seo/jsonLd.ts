import {
  absoluteUrl,
  siteConfig,
} from "@/lib/marketing/site";

export type JsonLdObject = Record<string, unknown>;

export type BreadcrumbJsonLdItem = {
  name: string;
  /** Absolute path or full URL. Omit for the current (last) crumb. */
  path?: string;
};

export type FaqJsonLdItem = {
  question: string;
  answer: string;
};

export type SoftwareApplicationJsonLdOptions = {
  description?: string;
  urlPath?: string;
};

/**
 * Serialize one or more JSON-LD graphs for a `<script type="application/ld+json">` tag.
 */
export function serializeJsonLd(
  data: JsonLdObject | JsonLdObject[]
): string {
  return JSON.stringify(data);
}

export function createOrganizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.tagline,
    logo: siteConfig.logo,
  };
}

export function createSoftwareApplicationJsonLd(
  options: SoftwareApplicationJsonLdOptions = {}
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description:
      options.description ?? siteConfig.tagline,
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "7.99",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "Family",
        price: "14.99",
        priceCurrency: "USD",
      },
    ],
    url: absoluteUrl(options.urlPath ?? "/"),
  };
}

export function createBreadcrumbJsonLd(
  items: ReadonlyArray<BreadcrumbJsonLdItem>
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const entry: JsonLdObject = {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
      };

      if (item.path) {
        entry.item = item.path.startsWith("http")
          ? item.path
          : absoluteUrl(item.path);
      }

      return entry;
    }),
  };
}

export function createFaqJsonLd(
  items: ReadonlyArray<FaqJsonLdItem>
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function createWebPageJsonLd(input: {
  title: string;
  description: string;
  path: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
  };
}

export function createArticleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  updatedAt?: string;
  keywords?: string[];
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt ?? input.publishedAt,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: siteConfig.logo,
      },
    },
    mainEntityOfPage: absoluteUrl(input.path),
    keywords: input.keywords?.join(", "),
    image: absoluteUrl(siteConfig.defaultOgImage),
  };
}

export type ProductJsonLdOptions = {
  name?: string;
  description: string;
  urlPath: string;
  /** Optional SKU-like identifier for the page product framing */
  sku?: string;
  category?: string;
};

/**
 * Product schema for comparison / buying-guide pages.
 * Mirrors Home Tech Vault’s published plan offers.
 */
export function createProductJsonLd(
  options: ProductJsonLdOptions
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: options.name ?? siteConfig.name,
    description: options.description,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    category: options.category ?? "Home inventory software",
    sku: options.sku,
    image: absoluteUrl(siteConfig.defaultOgImage),
    url: absoluteUrl(options.urlPath),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "0",
      highPrice: "14.99",
      offerCount: 3,
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: absoluteUrl("/pricing"),
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "7.99",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: absoluteUrl("/pricing"),
        },
        {
          "@type": "Offer",
          name: "Family",
          price: "14.99",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: absoluteUrl("/pricing"),
        },
      ],
    },
  };
}

/**
 * Bundle the default page graph every SEO page should emit.
 */
export function createDefaultPageJsonLd(input: {
  title: string;
  description: string;
  path: string;
  breadcrumbs: ReadonlyArray<BreadcrumbJsonLdItem>;
  includeSoftwareApplication?: boolean;
}): JsonLdObject[] {
  const graph: JsonLdObject[] = [
    createWebPageJsonLd({
      title: input.title,
      description: input.description,
      path: input.path,
    }),
    createBreadcrumbJsonLd(input.breadcrumbs),
  ];

  if (input.includeSoftwareApplication !== false) {
    graph.push(
      createSoftwareApplicationJsonLd({
        description: input.description,
        urlPath: input.path,
      })
    );
  }

  return graph;
}
