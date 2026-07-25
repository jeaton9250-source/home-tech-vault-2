import GuidesHub from "@/components/seo/GuidesHub";
import { getAllProgrammaticGuides } from "@/lib/seo/programmatic";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Device Brand Guides — Organize Home Tech by Brand",
  description:
    "Programmatic SEO guides for Apple, Samsung, LG, networking brands, smart home gear, and more. Organize devices, track warranties, and store network context.",
  path: "/guides",
  keywords: [
    "device brand guides",
    "organize apple devices",
    "samsung tv organization",
    "router password storage",
    "smart home device inventory",
  ],
});

type PageProps = {
  searchParams: Promise<{ brand?: string }>;
};

export default async function GuidesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const pages = getAllProgrammaticGuides();

  return (
    <GuidesHub
      pages={pages}
      activeBrand={params.brand ?? null}
    />
  );
}
