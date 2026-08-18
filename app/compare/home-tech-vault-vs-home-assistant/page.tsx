import type { Metadata } from "next";

import ComparisonLandingPage from "@/components/marketing/ComparisonLandingPage";

export const metadata: Metadata = {
  title: "Home Tech Vault vs. Home Assistant | Inventory vs. Automation",
  description:
    "Compare Home Tech Vault and Home Assistant. Learn the difference between home technology inventory and warranty organization versus local smart-home automation and control.",
  alternates: {
    canonical:
      "https://www.hometechvault.com/compare/home-tech-vault-vs-home-assistant",
  },
};

export default function HomeAssistantComparisonPage() {
  return (
    <ComparisonLandingPage
      competitorName="Home Assistant"
      eyebrow="Home Tech Vault vs. Home Assistant"
      headline="Organize your technology or automate your smart home?"
      summary="These products solve different problems and can be complementary. Home Tech Vault organizes devices, warranties, receipts, manuals, documents, and maintenance. Home Assistant is an open-source platform focused on local smart-home integrations, control, and automation."
      bestForHomeTechVault="You want an easy household record of what you own, where its documentation lives, when warranties expire, and what appears on your network."
      bestForCompetitor="You want deep smart-home integrations, local control, dashboards, sensors, and advanced automations — and you are comfortable operating a dedicated smart-home platform."
      officialSourceUrl="https://www.home-assistant.io/"
      rows={[
        {
          feature: "Primary purpose",
          homeTechVault: "Inventory, warranties, documents, and device records",
          competitor: "Smart-home control, integrations, and automation",
        },
        {
          feature: "Local smart-home automation",
          homeTechVault: "Not a replacement for an automation hub",
          competitor: "Core product strength",
          homeTechVaultPositive: false,
        },
        {
          feature: "Receipts, manuals, and warranty tracking",
          homeTechVault: "Central product workflow",
          competitor: "Not the platform's primary purpose",
          competitorPositive: false,
        },
        {
          feature: "Network/device awareness",
          homeTechVault: "Optional discovery for organizing household devices",
          competitor: "Discovers supported devices for integrations and control",
        },
      ]}
    />
  );
}
