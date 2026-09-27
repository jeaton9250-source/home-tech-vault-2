import SEOLandingPage from "@/components/seo/SEOLandingPage";
import { createSeoMetadata } from "@/lib/seo";
import { getSeoLandingPage } from "@/lib/seo/landingPages";

const page = getSeoLandingPage("appliance-model-serial-number")!;

export const metadata = createSeoMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.path,
  keywords: page.keywords,
});

export default function ApplianceModelSerialNumberPage() {
  return <SEOLandingPage page={page} />;
}
