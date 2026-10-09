import {
  MarketingImg,
  MarketingText,
} from "@/components/marketing/MarketingContent";
import PublicMarketingShell from "@/components/landing/public/PublicMarketingShell";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
export const metadata: Metadata = {
  title: "About Home Tech Vault | Built by Jason Eaton",
  description:
    "Meet Jason Eaton and learn why Home Tech Vault was built to make home technology, warranties, documents, and device information easier to manage.",
  alternates: { canonical: "https://www.hometechvault.com/about" },
};
export default function AboutPage() {
  const founderPhoto = "/images/jason-eaton.jpg";
  const linkedinUrl = process.env.NEXT_PUBLIC_FOUNDER_LINKEDIN_URL;
  return (
    <PublicMarketingShell>
      <div className="min-h-screen bg-surface-base">
        <main className="px-5 py-16 md:px-8 md:py-24 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[32px] border border-border-subtle bg-surface-card p-6 shadow-lift">
                {founderPhoto ? (
                  <MarketingImg
                    src={founderPhoto}
                    alt="Jason Eaton, founder of Home Tech Vault"
                    className="h-auto w-full rounded-[24px] object-contain"
                    scope="app/about/page.tsx"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded-[24px] bg-gradient-to-br from-home-health-soft to-premium-soft text-6xl font-semibold text-text-primary">
                    <MarketingText scope="app/about/page.tsx">
                      {"JE"}
                    </MarketingText>
                  </div>
                )}
                <p className="mt-4 text-xl font-semibold text-text-primary">
                  <MarketingText scope="app/about/page.tsx">
                    {"Jason Eaton"}
                  </MarketingText>
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  <MarketingText scope="app/about/page.tsx">
                    {"Founder, Home Tech Vault"}
                  </MarketingText>
                </p>
                {linkedinUrl ? (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 font-semibold text-interaction underline underline-offset-4"
                  >
                    <ExternalLink size={17} aria-hidden />
                    <MarketingText scope="app/about/page.tsx">
                      {"Connect on LinkedIn"}
                    </MarketingText>
                  </a>
                ) : null}
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-home-health">
                  <MarketingText scope="app/about/page.tsx">
                    {"Why I built Home Tech Vault"}
                  </MarketingText>
                </p>
                <h1 className="mt-4 text-4xl font-medium tracking-[-0.04em] text-text-primary md:text-6xl">
                  <MarketingText scope="app/about/page.tsx">
                    {
                      "Home technology should be easier to understand and protect."
                    }
                  </MarketingText>
                </h1>
                <div className="mt-7 space-y-5 text-base leading-8 text-text-secondary">
                  <p>
                    <MarketingText scope="app/about/page.tsx">
                      {
                        "I'm Jason Eaton, the founder of Home Tech Vault. I built it because the information we need for our home technology is usually scattered across drawers, email receipts, manufacturer websites, notes, and memory."
                      }
                    </MarketingText>
                  </p>
                  <p>
                    <MarketingText scope="app/about/page.tsx">
                      {
                        "When a device breaks or a warranty question comes up, homeowners should not have to search through five different places. Home Tech Vault gives each household one organized place for devices, warranties, receipts, manuals, documents, Home Wi-Fi information, and maintenance history."
                      }
                    </MarketingText>
                  </p>
                  <p>
                    <MarketingText scope="app/about/page.tsx">
                      {
                        "My goal is to build a practical product that makes technology feel less overwhelming \u2014 especially for people who do not want to become their own IT department just to manage the devices in their home."
                      }
                    </MarketingText>
                  </p>
                </div>

                <div className="mt-8 rounded-2xl border border-home-health/20 bg-home-health-soft p-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={21}
                      className="mt-0.5 shrink-0 text-home-health"
                    />
                    <p className="text-sm leading-7 text-text-primary">
                      <MarketingText scope="app/about/page.tsx">
                        {
                          "Home Tech Vault is being built with transparent platform support, clear privacy explanations, and honest customer proof \u2014 not fake reviews or inflated usage numbers."
                        }
                      </MarketingText>
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/signup"
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-charcoal px-6 py-3 font-semibold text-white"
                  >
                    <MarketingText scope="app/about/page.tsx">
                      {"Start Free"}
                    </MarketingText>
                    <ArrowRight size={16} className="ml-2" aria-hidden />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-border-subtle bg-surface-card px-6 py-3 font-semibold text-text-primary"
                  >
                    <MarketingText scope="app/about/page.tsx">
                      {"Contact Jason"}
                    </MarketingText>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PublicMarketingShell>
  );
}
