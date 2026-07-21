import type { MetadataRoute } from "next";

import {
  INDEXABLE_MARKETING_PATHS,
} from "@/lib/marketing/routes";
import { getSiteUrl } from "@/lib/marketing/site";

const siteUrl = getSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return INDEXABLE_MARKETING_PATHS.map((path) => ({
    url:
      path === "/"
        ? `${siteUrl}/`
        : `${siteUrl}${path}`,
    lastModified,
    changeFrequency:
      path === "/"
        ? "weekly"
        : path === "/pricing"
          ? "monthly"
          : "monthly",
    priority:
      path === "/"
        ? 1
        : path === "/pricing"
          ? 0.9
          : 0.7,
  }));
}
