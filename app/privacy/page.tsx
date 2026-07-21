import Link from "next/link";

import MarketingLayout, {
  MarketingContent,
  MarketingPageHero,
} from "@/components/marketing/MarketingLayout";
import { createPageMetadata } from "@/lib/marketing/metadata";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "How Home Tech Vault collects, uses, and protects your personal information and household data.",
  path: MARKETING_ROUTES.privacy,
});

const sections = [
  {
    title: "Overview",
    body: "Home Tech Vault respects your privacy. This policy explains what we collect, how we use it, and the choices available to you when you use our website and application.",
  },
  {
    title: "Information we collect",
    body: "We collect information you provide directly — such as your name, email address, household details, device inventory, uploaded documents, and support messages — along with basic usage data needed to operate the service securely.",
  },
  {
    title: "How we use information",
    body: "We use your information to provide Home Tech Vault, secure your account, process subscriptions, respond to support requests, improve reliability, and communicate important service updates. We do not sell your personal information.",
  },
  {
    title: "Data storage and security",
    body: "Your data is transmitted over encrypted connections and stored using industry-standard cloud infrastructure. Access is limited to authenticated users and invited household members according to role-based permissions.",
  },
  {
    title: "Household sharing",
    body: "If you use Family plan features, information you add to a shared household may be visible to other members according to their assigned role. You control invitations and can manage access from household settings.",
  },
  {
    title: "Analytics",
    body: "We may use privacy-conscious analytics to understand how the public website is used and to improve conversion, performance, and content. Analytics data is aggregated and does not include document contents.",
  },
  {
    title: "Your choices",
    body: "You may update account information, manage billing, and request account deletion by contacting us. You can also control cookies through your browser settings.",
  },
  {
    title: "Contact",
    body: "Privacy questions can be sent through our Contact page.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <MarketingPageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="Last updated: July 20, 2026"
      />

      <MarketingContent className="pt-0">
        <div className="mx-auto max-w-3xl space-y-10 text-sm leading-7 text-text-secondary">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-medium text-text-primary">
                {section.title}
              </h2>

              <p className="mt-3">
                {section.title === "Contact" ? (
                  <>
                    Privacy questions can be sent
                    through our{" "}
                    <Link
                      href={MARKETING_ROUTES.contact}
                      className="font-medium text-interaction hover:text-interaction-hover"
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
