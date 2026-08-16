import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/marketing/site";

const siteUrl = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/upgrade/success",
        "/dashboard",
        "/devices",
        "/documents",
        "/network",
        "/home/",
        "/family",
        "/settings",
        "/account",
        "/reports",
        "/admin",
        "/api/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
