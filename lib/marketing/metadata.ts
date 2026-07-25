import type { Metadata } from "next";

import {
  SOCIAL_DEFAULT_TITLE,
  SOCIAL_OG_DESCRIPTION,
  SOCIAL_OG_TITLE,
  SOCIAL_TWITTER_DESCRIPTION,
  SOCIAL_TWITTER_TITLE,
} from "@/lib/marketing/socialMetadata";
import {
  absoluteUrl,
  siteConfig,
} from "@/lib/marketing/site";

// Prefer `@/lib/seo` for new pages. Re-exports keep a single JSON-LD source.
export {
  createBreadcrumbJsonLd,
} from "@/lib/seo/jsonLd";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  keywords,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const fullTitle =
    path === "/"
      ? SOCIAL_DEFAULT_TITLE
      : `${title} | ${siteConfig.name}`;

  const openGraph: NonNullable<
    Metadata["openGraph"]
  > = {
    type,
    locale: "en_US",
    url: canonical,
    siteName: siteConfig.name,
    title:
      path === "/"
        ? SOCIAL_OG_TITLE
        : `${title} | ${siteConfig.name}`,
    description:
      path === "/"
        ? SOCIAL_OG_DESCRIPTION
        : description,
    images: [
      {
        url: siteConfig.defaultOgImage,
        width: 1200,
        height: 630,
        alt: siteConfig.defaultOgImageAlt,
      },
    ],
    ...(type === "article" && publishedTime
      ? { publishedTime }
      : {}),
  };

  return {
    title: fullTitle,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title:
        path === "/"
          ? SOCIAL_TWITTER_TITLE
          : fullTitle,
      description:
        path === "/"
          ? SOCIAL_TWITTER_DESCRIPTION
          : description,
      images: [siteConfig.defaultOgImage],
      creator: siteConfig.twitterHandle,
    },
  };
}

export function createFaqJsonLd(
  items: ReadonlyArray<{
    question: string;
    answer: string;
  }>
) {
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

export function createOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.tagline,
    logo: siteConfig.logo,
  };
}

export function createSoftwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
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
    url: absoluteUrl("/"),
  };
}
