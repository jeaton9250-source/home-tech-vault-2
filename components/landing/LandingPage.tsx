"use client";

import CinematicHomeExperience from "@/components/landing/public/CinematicHomeExperience";
import LandingFooter from "@/components/landing/public/LandingFooter";
import LandingHeader from "@/components/landing/public/LandingHeader";
import { landingTheme } from "@/components/landing/public/landingTheme";

import StructuredData from "@/components/marketing/StructuredData";

import { useDemoMode } from "@/hooks/useDemoMode";

import { createOrganizationJsonLd } from "@/lib/marketing/metadata";

type LandingPageProps = {
  foundingSummary?: unknown;
};

export default function LandingPage({
  foundingSummary: _foundingSummary = null,
}: LandingPageProps) {
  const {
    user,
    loading,
  } = useDemoMode();

  const isSignedIn =
    !loading && Boolean(user);

  return (
    <div className={landingTheme.page}>
      <StructuredData
        data={createOrganizationJsonLd()}
      />

      <LandingHeader
        isSignedIn={isSignedIn}
      />

      <main id="main-content">
        <CinematicHomeExperience
          isSignedIn={isSignedIn}
        />
      </main>

      <LandingFooter />
    </div>
  );
}
