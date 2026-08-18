import type { Metadata } from "next";

import ComparisonLandingPage from "@/components/marketing/ComparisonLandingPage";

export const metadata: Metadata = {
  title: "Home Tech Vault vs. Sortly | Home Technology Inventory Comparison",
  description:
    "Compare Home Tech Vault and Sortly for device inventory, warranties, documents, network discovery, and general inventory management.",
  alternates: {
    canonical: "https://www.hometechvault.com/compare/home-tech-vault-vs-sortly",
  },
};

export default function SortlyComparisonPage() {
  return (
    <ComparisonLandingPage
      competitorName="Sortly"
      eyebrow="Home Tech Vault vs. Sortly"
      headline="A home technology vault or a general inventory system?"
      summary="Both products can help organize items, but they are built around different jobs. Home Tech Vault focuses on household technology, warranties, documents, and network discovery. Sortly is a broader inventory-management platform."
      bestForHomeTechVault="You want a homeowner-friendly place for devices, warranty dates, receipts, manuals, network information, maintenance, and optional automatic discovery."
      bestForCompetitor="You need broader inventory workflows such as business stock, supplies, assets, barcode or QR processes, and inventory operations beyond home technology."
      officialSourceUrl="https://www.sortly.com/"
      rows={[
        {
          feature: "Primary purpose",
          homeTechVault: "Home technology inventory and warranty organization",
          competitor: "General inventory and asset management",
        },
        {
          feature: "Automatic home-network discovery",
          homeTechVault: "Available through the optional Mac connector",
          competitor: "Not the product's primary workflow",
          competitorPositive: false,
        },
        {
          feature: "Warranty, receipt, and manual context",
          homeTechVault: "Built around household devices",
          competitor: "Can attach item information in a general inventory structure",
        },
        {
          feature: "Business inventory workflows",
          homeTechVault: "Not the focus",
          competitor: "Designed for broader inventory use cases",
          homeTechVaultPositive: false,
        },
      ]}
    />
  );
}
