import type { Metadata } from "next";

import HomeTechHealthCheck from "@/components/health-check/HomeTechHealthCheck";
import LandingFooter from "@/components/landing/public/LandingFooter";
import LandingHeader from "@/components/landing/public/LandingHeader";

export const metadata: Metadata = {
  title:
    "Free Home Tech Health Check | Home Tech Vault",
  description:
    "Take the free 60-second Home Tech Health Check and get a personalized score for your devices, warranties, documents, network security, backups, and technology readiness.",
  alternates: {
    canonical:
      "https://www.hometechvault.com/health-check",
  },
  openGraph: {
    title:
      "Free Home Tech Health Check | Home Tech Vault",
    description:
      "See how organized and prepared your home technology is with a free 60-second health check.",
    url:
      "https://www.hometechvault.com/health-check",
    siteName: "Home Tech Vault",
    type: "website",
  },
};

export default function HealthCheckPage() {
  return (
    <div className="min-h-screen bg-[#f5f1e8]">
      <LandingHeader />

      <main className="px-5 py-14 md:px-8 md:py-20 lg:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#617c43]">
              Free • About 60 seconds
            </p>

            <h1 className="mt-4 font-serif text-4xl font-medium tracking-[-0.04em] text-[#17212a] md:text-6xl">
              How healthy is your home technology?
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#68737b] md:text-lg">
              Answer 10 quick questions and get an
              instant Home Tech Health Score with
              personalized next steps. No account
              required.
            </p>
          </div>

          <HomeTechHealthCheck />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
