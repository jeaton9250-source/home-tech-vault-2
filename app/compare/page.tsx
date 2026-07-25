import CompareHub from "@/components/seo/CompareHub";
import { getAllComparisonPages } from "@/lib/seo/comparisons/pages";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Compare Home Tech Vault — vs Notion, Sheets, Airtable & More",
  description:
    "Objective comparisons of Home Tech Vault versus Notion, spreadsheets, Google Sheets, Airtable, and paper records — plus guides to home inventory and warranty trackers.",
  path: "/compare",
  keywords: [
    "Home Tech Vault vs Notion",
    "best home inventory software",
    "best warranty tracker",
    "Home Tech Vault comparison",
  ],
});

export default function ComparePage() {
  return <CompareHub pages={getAllComparisonPages()} />;
}
