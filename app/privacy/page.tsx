import { MarketingText } from "@/components/marketing/MarketingContent";
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
    body: "If you use Household plan features, information you add to a shared household may be visible to other members according to their assigned role. You control invitations and can manage access from household settings.",
  },
  {
    title: "Ask My Home and troubleshooting AI",
    body: "When you choose Continue with AI in the mobile app, your question, recent conversation and relevant user-owned device details (including make/model, purchase and warranty dates), document names and types, maintenance, subscription details, non-secret network information and saved troubleshooting history are sent to Groq to generate answers. Document contents, Wi-Fi passwords and authentication credentials are not included in the vault snapshot. If you attach a troubleshooting photo, the image is sent to OpenAI to read visible text, and that text is sent to Groq. Avoid including passwords, people, addresses or other sensitive information in photos or questions. HTV does not retain troubleshooting photos or full conversations; issue descriptions, AI summaries and resolutions are saved only when you choose Save issue or That fixed it. You can delete individual saved issues, stop sharing with AI, or request account deletion in the app. AI requests use store:false where supported; this does not guarantee zero provider retention. Groq and OpenAI process data under their respective service terms and privacy policies, including applicable security and abuse-monitoring retention. Review https://groq.com/privacy-policy/ and https://openai.com/policies/privacy-policy/ before using AI. Existing device scanning and AI product identification also use OpenAI. Camera permission alone is not consent to send data to AI.",
  },
  {
    title: "Optional app recommendations",
    body: "If you choose Show recommendations in the mobile app, CrossPromo receives app/platform/version details and app-integrity verification to load third-party app advertisements. It records anonymous ad impressions and clicks. HTV does not send your vault records to CrossPromo. You can choose No thanks before loading ads, hide recommendations, view About this ad, or report an ad. CrossPromo's SDK documentation states these interactions are not linked to identity and are not used for cross-app tracking. The production SDK and privacy disclosures are reviewed for every release.",
  },
  {
    title: "Analytics",
    body: "We may use privacy-conscious analytics to understand how the public website is used and to improve conversion, performance, and content. Analytics data is aggregated and does not include document contents.",
  },
  {
    title: "Your choices",
    body: "You may update your account information and notification preferences at any time. Signed-in mobile users can start account deletion directly from Your account. Access is disabled immediately and account and vault data are permanently erased within seven days, subject only to legal retention requirements. You can also control cookies through your browser settings.",
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
        description="Last updated: October 14, 2026"
      />

      <MarketingContent className="pt-0">
        <div className="mx-auto max-w-3xl space-y-10 rounded-[28px] border border-[#182533]/10 bg-[#f8f5ef] p-6 text-sm leading-7 text-[#4f5b63] shadow-[0_18px_45px_-36px_rgba(15,25,35,0.35)] sm:p-8 md:p-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-serif text-xl font-medium tracking-[-0.025em] text-[#17212a]">
                <MarketingText scope="shared">{section.title}</MarketingText>
              </h2>

              <p className="mt-3">
                {section.title === "Contact" ? (
                  <>
                    Privacy questions can be sent through our{" "}
                    <Link
                      href={MARKETING_ROUTES.contact}
                      className="font-semibold text-[#617c43] underline decoration-[#617c43]/30 underline-offset-4 transition hover:text-[#718d4f]"
                    >
                      <MarketingText scope="app/privacy/page.tsx">
                        {"Contact page"}
                      </MarketingText>
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
