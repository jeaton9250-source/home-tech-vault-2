import type { Metadata } from "next";

import ComparisonLandingPage from "@/components/marketing/ComparisonLandingPage";

export const metadata: Metadata = {
  title: "Home Tech Vault vs. HomeZada | Home Inventory Comparison",
  description:
    "Compare Home Tech Vault and HomeZada for home inventory, technology warranties, documents, maintenance, projects, finances, and device discovery.",
  alternates: {
    canonical: "https://www.hometechvault.com/compare/home-tech-vault-vs-homezada",
  },
};

export default function HomeZadaComparisonPage() {
  return (
    <ComparisonLandingPage
      competitorName="HomeZada"
      eyebrow="Home Tech Vault vs. HomeZada"
      headline="Focused home technology management or broader home management?"
      summary="Home Tech Vault is intentionally focused on the technology inside a home. HomeZada covers a wider set of homeowner jobs, including inventory, maintenance, projects, and home finances."
      bestForHomeTechVault="Your priority is organizing devices, warranties, receipts, manuals, Home Wi-Fi information, and technology maintenance with optional Wi-Fi device discovery."
      bestForCompetitor="You want a broader whole-home platform that includes home projects, general maintenance, property information, and financial management alongside inventory."
      officialSourceUrl="https://www.homezada.com/buyers-sellers/pricing"
      rows={[
        {
          feature: "Primary purpose",
          homeTechVault: "Technology-specific home inventory and protection",
          competitor: "Broader whole-home management",
        },
        {
          feature: "Automatic Wi-Fi device discovery",
          homeTechVault: "Available through the optional Mac connector",
          competitor: "Not presented as the main inventory workflow",
          competitorPositive: false,
        },
        {
          feature: "Home projects and finances",
          homeTechVault: "Not the focus",
          competitor: "Included in broader paid home-management features",
          homeTechVaultPositive: false,
        },
        {
          feature: "Technology warranty context",
          homeTechVault: "Central product workflow",
          competitor: "Handled within a broader home inventory system",
        },
      ]}
    />
  );
}
