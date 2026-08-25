import SEOLandingPage from "@/components/seo/SEOLandingPage";
import { createSeoMetadata } from "@/lib/seo";
import { getSeoLandingPage } from "@/lib/seo/landingPages";

const basePage = getSeoLandingPage("network-documentation")!;

const page = {
  ...basePage,
  screenshots: [],
};

export const metadata = createSeoMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.path,
  keywords: page.keywords,
});

export default function Page() {
  return <SEOLandingPage page={page} />;
}
