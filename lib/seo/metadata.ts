import type { Metadata } from "next";

import {
  createPageMetadata,
} from "@/lib/marketing/metadata";
import { absoluteUrl } from "@/lib/marketing/site";

export type SeoPageInput = {
  title: string;
  description: string;
  /** Absolute path beginning with `/` */
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  keywords?: string[];
  noIndex?: boolean;
  /** Optional OG/Twitter image override (path or absolute URL) */
  image?: string;
  imageAlt?: string;
};

/**
 * App Router metadata helper for marketing and content pages.
 * Produces title, description, canonical, Open Graph, and Twitter Card fields.
 */
export function createSeoMetadata(
  input: SeoPageInput
): Metadata {
  const metadata = createPageMetadata({
    title: input.title,
    description: input.description,
    path: input.path,
    type: input.type,
    publishedTime: input.publishedTime,
    keywords: input.keywords,
    noIndex: input.noIndex,
  });

  if (!input.image) {
    return metadata;
  }

  const imageUrl = input.image.startsWith("http")
    ? input.image
    : absoluteUrl(input.image);

  const imageAlt =
    input.imageAlt ?? input.title;

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      ...metadata.twitter,
      images: [imageUrl],
    },
  };
}

export {
  createPageMetadata,
} from "@/lib/marketing/metadata";
