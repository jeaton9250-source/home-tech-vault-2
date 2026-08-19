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
        "/set-password",
        "/auth",
        "/upgrade/success",
        "/dashboard",
        "/devices",
        "/documents",
        "/network",
        "/home",
        "/family",
        "/settings",
        "/account",
        "/profile",
        "/reports",
        "/warranties",
        "/imports",
        "/notifications",
        "/maintenance",
        "/subscriptions",
        "/activity",
        "/audit",
        "/advisor",
        "/ai",
        "/insights",
        "/smart-search",
        "/onboarding",
        "/invite/",
        "/apple-home/",
        "/upgrade",
        "/admin",
        "/api/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
