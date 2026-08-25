import Link from "next/link";

import MarketingLayout, {
  MarketingContent,
  MarketingPageHero,
} from "@/components/marketing/MarketingLayout";
import { createPageMetadata } from "@/lib/marketing/metadata";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

export const metadata = createPageMetadata({
  title: "Terms of Service",
  description:
    "Terms governing your use of Home Tech Vault, including accounts, subscriptions, and acceptable use.",
  path: MARKETING_ROUTES.terms,
});

const sections = [
  {
    title: "Agreement",
    body: "By accessing or using Home Tech Vault, you agree to these Terms of Service. If you do not agree, please do not use the service.",
  },
  {
    title: "The service",
    body: "Home Tech Vault helps households organize technology, documents, warranties, maintenance, Home Wi-Fi information, and related home records. Available features depend on your subscription plan.",
  },
  {
    title: "Accounts",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must provide accurate registration information.",
  },
  {
    title: "Acceptable use",
    body: "You agree to use Home Tech Vault lawfully and in good faith. You may not attempt to disrupt the service, access another user's data without authorization, or upload unlawful content.",
  },
  {
    title: "Subscriptions and billing",
    body: "Paid plans renew according to the billing cycle selected at purchase unless canceled. Pricing and plan features may change with reasonable notice. Refund policies are described at checkout and in billing settings.",
  },
  {
    title: "Household sharing",
    body: "Family plan administrators are responsible for invitations and permissions granted to household members. Shared data remains subject to these terms for all members of the household.",
  },
  {
    title: "Disclaimer",
    body: "Home Tech Vault is provided on an as-is basis. We strive for reliability but do not guarantee uninterrupted access. You remain responsible for maintaining backups of critical records where appropriate.",
  },
  {
    title: "Contact",
    body: "Questions about these terms can be sent through our Contact page.",
  },
] as const;

export default function TermsPage() {
  return (
    <MarketingLayout>
      <MarketingPageHero
        eyebrow="Legal"
        title="Terms of Service"
        description="Last updated: July 20, 2026"
      />

      <MarketingContent className="pt-0">
        <div className="mx-auto max-w-3xl space-y-10 rounded-[28px] border border-[#182533]/10 bg-[#f8f5ef] p-6 text-sm leading-7 text-[#4f5b63] shadow-[0_18px_45px_-36px_rgba(15,25,35,0.35)] sm:p-8 md:p-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-serif text-xl font-medium tracking-[-0.025em] text-[#17212a]">
                {section.title}
              </h2>

              <p className="mt-3">
                {section.title === "Contact" ? (
                  <>
                    Questions about these terms can
                    be sent through our{" "}
                    <Link
                      href={MARKETING_ROUTES.contact}
                      className="font-semibold text-[#617c43] underline decoration-[#617c43]/30 underline-offset-4 transition hover:text-[#718d4f]"
                    >
                      Contact page
                    </Link>
                    .
                  </>
                ) : (
                  section.body
                )}
              </p>
            </section>
          ))}
        </div>
      </MarketingContent>
    </MarketingLayout>
  );
}
