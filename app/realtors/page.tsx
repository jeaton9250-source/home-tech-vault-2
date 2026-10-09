import {
  MarketingText,
  MarketingImg,
} from "@/components/marketing/MarketingContent";
import { SitePage } from "@/components/marketing/RedesignSitePage";
export default function RealtorsPage() {
  return (
    <SitePage
      visual={
        <MarketingImg
          src="/images/home-hero.jpg"
          alt="Modern home exterior framed by trees and landscaping"
          width={800}
          height={480}
          fetchPriority="high"
          className="aspect-[4/3] w-full object-cover lg:aspect-[4/5]"
          scope="app/realtors/page.tsx"
        />
      }
      eyebrow="A CLOSING GIFT FOR THE HOME"
      title={
        <>
          <MarketingText scope="app/realtors/page.tsx">
            {"Give them more"}
          </MarketingText>
          <br />
          <MarketingText scope="app/realtors/page.tsx">
            {"than the keys."}
          </MarketingText>
        </>
      }
      intro="Welcome your buyers with a beautifully prepared record of their new home—useful details, documents and history gathered in one place from the very first day."
    >
      <p className="mt-4 text-lg text-[#536174]">
        <MarketingText scope="app/realtors/page.tsx">
          {
            "A thoughtful gift for closing day. A useful gift for every day after."
          }
        </MarketingText>
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="/realtors/signup"
          className="rounded-full bg-[#18283b] px-6 py-3 font-semibold text-white"
        >
          <MarketingText scope="app/realtors/page.tsx">
            {"Prepare a home gift"}
          </MarketingText>
        </a>
        <a
          href="#receive"
          className="rounded-full border border-[#18283b]/20 px-6 py-3 font-semibold"
        >
          <MarketingText scope="app/realtors/page.tsx">
            {"See what they receive"}
          </MarketingText>
        </a>
      </div>
      <section
        id="receive"
        className="mt-24 rounded-2xl bg-[#18283b] p-8 text-[#f5f2eb] md:p-12"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c6c16a]">
          <MarketingText scope="app/realtors/page.tsx">
            {"WELCOME HOME"}
          </MarketingText>
        </p>
        <h2 className="mt-5 font-serif text-5xl">
          <MarketingText scope="app/realtors/page.tsx">
            {"Sample home gift \u00B7 The Collins Home"}
          </MarketingText>
        </h2>
        <p className="mt-3 text-white/65">
          <MarketingText scope="app/realtors/page.tsx">
            {"24 Hawthorne Lane"}
          </MarketingText>
        </p>
        <p className="mt-10 max-w-xl font-serif text-3xl">
          <MarketingText scope="app/realtors/page.tsx">
            {"May this home hold years of wonderful memories."}
          </MarketingText>
        </p>
        <p className="mt-12 border-t border-white/15 pt-5 text-xs uppercase tracking-[0.2em] text-white/50">
          <MarketingText scope="app/realtors/page.tsx">
            {"PREPARED WITH CARE BY YOUR REALTOR"}
          </MarketingText>
        </p>
      </section>
      <section className="mt-24 grid gap-8 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a09b31]">
            <MarketingText scope="app/realtors/page.tsx">
              {"A GIFT WITH A LONGER LIFE"}
            </MarketingText>
          </p>
          <h2 className="mt-5 font-serif text-5xl leading-none">
            <MarketingText scope="app/realtors/page.tsx">
              {
                "Some gifts celebrate the day. This one helps them feel at home."
              }
            </MarketingText>
          </h2>
        </div>
        <p className="text-lg leading-relaxed text-[#536174]">
          <MarketingText scope="app/realtors/page.tsx">
            {
              "Long after the flowers fade and the boxes are unpacked, your buyers will still need the dishwasher manual, the paint color, the HVAC service date or the warranty they forgot they had. Home Tech Vault makes your care part of the home they remember."
            }
          </MarketingText>
        </p>
      </section>
    </SitePage>
  );
}
