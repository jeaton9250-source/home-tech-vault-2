import SEOLandingPage from "@/components/seo/SEOLandingPage";
import { createSeoMetadata } from "@/lib/seo";
import { getSeoLandingPage } from "@/lib/seo/landingPages";

const page = getSeoLandingPage("home-maintenance-checklist")!;

export const metadata = createSeoMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.path,
  keywords: page.keywords,
});

export default function HomeMaintenanceChecklistPage() {
  return <SEOLandingPage page={page} />;
}
