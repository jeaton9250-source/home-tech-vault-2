import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/$/,
    ""
  ) ?? "https://hometechvault.com";

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
        "/home",
        "/family",
        "/settings",
        "/account",
        "/reports",
        "/api/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
