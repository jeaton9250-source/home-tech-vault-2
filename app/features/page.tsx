import type { Metadata } from "next";

import LandingFooter from "@/components/landing/public/LandingFooter";
import LandingHeader from "@/components/landing/public/LandingHeader";
import { landingTheme } from "@/components/landing/public/landingTheme";
import FeaturesPageContent from "@/components/marketing/FeaturesPageContent";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Features — Home Tech Vault",
  description:
    "Explore Home Tech Vault features for devices, documents, warranties, maintenance, Home Wi-Fi, household sharing, and search.",
};

export default async function FeaturesPage() {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  const isSignedIn =
    Boolean(user);

  return (
    <div className={landingTheme.page}>
      <LandingHeader
        isSignedIn={isSignedIn}
      />

      <FeaturesPageContent />

      <LandingFooter />
    </div>
  );
}
