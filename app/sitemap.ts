import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/$/,
    ""
  ) ?? "https://hometechvault.com";

/** Public marketing pages worth indexing. */
const indexablePaths = [
  "/",
  "/demo",
  "/contact",
  "/upgrade",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return indexablePaths.map((path) => ({
    url:
      path === "/"
        ? `${siteUrl}/`
        : `${siteUrl}${path}`,
    lastModified,
    changeFrequency:
      path === "/" ? "weekly" : "monthly",
    priority:
      path === "/"
        ? 1
        : path === "/upgrade"
          ? 0.8
          : 0.7,
  }));
}
