import GuidesHub from "@/components/seo/GuidesHub";
import { getAllProgrammaticGuides } from "@/lib/seo/programmatic";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Device Brand Guides — Organize Home Tech by Brand",
  description:
    "Find practical guides for organizing appliances, electronics and smart home equipment by brand, including purchase records, warranties and manuals.",
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
