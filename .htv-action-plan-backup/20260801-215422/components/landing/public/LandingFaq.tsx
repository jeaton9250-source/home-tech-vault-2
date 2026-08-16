import Link from "next/link";

import { landingTheme } from "@/components/landing/public/landingTheme";
import StructuredData from "@/components/marketing/StructuredData";

const faqs = [
  {
    question: "What is Home Tech Vault?",
    answer:
      "Home Tech Vault is a home inventory and warranty tracker built specifically for the technology in your home. It keeps device details, receipts, manuals, documents, warranties, and maintenance information together.",
  },
  {
    question: "Do I need the desktop connector?",
    answer:
      "No. You can use Home Tech Vault manually in any supported browser. The optional Mac connector adds automatic discovery of devices connected to your home network.",
  },
  {
    question: "Does device discovery work on Windows?",
    answer:
      "The current automatic-discovery connector is for Mac. Windows support is planned. The web vault itself works in a browser without the connector.",
  },
  {
    question: "What information does the connector collect?",
    answer:
      "The connector is designed to identify devices on the local network and send the discovered device details to the Home Tech Vault household you paired. The Trust Center explains the current data fields and controls in plain English.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. You can start a basic home technology inventory for free, then upgrade when you need expanded document, discovery, reminder, or household features.",
  },
  {
    question: "Can I cancel a paid plan?",
    answer:
      "Paid subscriptions can be managed from billing settings. Any cancellation timing and continued access are shown during the billing flow.",
  },
] as const;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function LandingFaq() {
  return (
    <section className="bg-surface-sunken px-5 py-20 md:px-8 lg:px-12">
      <StructuredData data={faqJsonLd} />
      <div className={landingTheme.sectionNarrow}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-home-health">
            Frequently asked questions
          </p>
          <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] text-text-primary md:text-5xl">
            Know how it works before you start.
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-[24px] border border-border-subtle bg-surface-card p-6 shadow-sm"
            >
              <summary className="cursor-pointer list-none pr-8 font-semibold text-text-primary marker:hidden">
                {faq.question}
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-text-secondary">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Have a privacy or platform question?{" "}
          <Link
            href="/trust"
            className="font-semibold text-interaction underline underline-offset-4"
          >
            Visit the Trust Center
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
