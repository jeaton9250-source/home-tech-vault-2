import type { Metadata } from "next";

import { rootSiteMetadata } from "@/lib/marketing/socialMetadata";
import {
  absoluteUrl,
  siteConfig,
} from "@/lib/marketing/siteConfig";

type MarketingMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

export function createMarketingMetadata({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
}: MarketingMetadataOptions = {}): Metadata {
  const resolvedTitle =
    title ?? rootSiteMetadata.title;

  const resolvedDescription =
    description ?? rootSiteMetadata.description;

  const resolvedImage =
    image ?? rootSiteMetadata.image;

  const canonicalUrl = absoluteUrl(path);

  return {
    title: resolvedTitle,
    description: resolvedDescription,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: siteConfig.name,
      title: resolvedTitle,
      description: resolvedDescription,
      images: resolvedImage
        ? [
            {
              url: absoluteUrl(resolvedImage),
              width: 1200,
              height: 630,
              alt: resolvedTitle,
            },
          ]
        : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: resolvedImage
        ? [absoluteUrl(resolvedImage)]
        : undefined,
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
  };
}
