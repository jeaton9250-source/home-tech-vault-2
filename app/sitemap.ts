import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/$/,
    ""
  ) ?? "https://hometechvault.com";

const publicPaths = [
  "/",
  "/demo",
  "/contact",
  "/login",
  "/signup",
  "/forgot-password",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicPaths.map((path) => ({
    url:
      path === "/"
        ? `${siteUrl}/`
        : `${siteUrl}${path}`,
    lastModified,
    changeFrequency:
      path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
