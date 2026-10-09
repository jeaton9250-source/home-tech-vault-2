import {
  MarketingText,
  MarketingImg,
} from "@/components/marketing/MarketingContent";
import { SitePage } from "@/components/marketing/RedesignSitePage";
export default function ExplorePage() {
  return (
    <SitePage
      visual={
        <MarketingImg
          src="/knowledge/heroes/how-to-inventory-every-device-in-your-home.jpg"
          alt="Two people reviewing information together on a laptop"
          width={1600}
          height={900}
          fetchPriority="high"
          className="aspect-[4/3] w-full object-cover lg:aspect-[4/5]"
          scope="app/explore/page.tsx"
        />
      }
      eyebrow="EXPLORE HOME TECH VAULT"
      title={
        <>
          <MarketingText scope="app/explore/page.tsx">
            {"See your home"}
          </MarketingText>
          <br />
          <MarketingText scope="app/explore/page.tsx">
            {"differently."}
          </MarketingText>
        </>
      }
      intro="Explore how Home Tech Vault brings the useful details of your home together — without turning your home into another complicated system."
    >
      <div className="mt-10 flex flex-wrap gap-3">
        <a
          href="/signup"
          className="rounded-full bg-[#18283b] px-6 py-3 font-semibold text-white"
        >
          <MarketingText scope="app/explore/page.tsx">
            {"Start Your Home"}
          </MarketingText>
        </a>
        <a
          href="#record"
          className="rounded-full border border-[#18283b]/20 px-6 py-3 font-semibold"
        >
          <MarketingText scope="app/explore/page.tsx">
            {"What It Remembers"}
          </MarketingText>
        </a>
      </div>
      <section
        id="record"
        className="mt-24 rounded-2xl bg-[#18283b] p-8 text-[#f5f2eb] md:p-12"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c6c16a]">
          <MarketingText scope="app/explore/page.tsx">
            {"HOME RECORD"}
          </MarketingText>
        </p>
        <h2 className="mt-5 font-serif text-5xl leading-none tracking-[-0.05em] md:text-6xl">
          <MarketingText scope="app/explore/page.tsx">
            {"Everything in its place."}
          </MarketingText>
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[
            [
              "01",
              "Add what matters",
              "Save appliances, receipts, documents, warranties and maintenance records.",
            ],
            [
              "02",
              "Build the history",
              "Your home record becomes more useful every time something changes.",
            ],
            [
              "03",
              "Find it later",
              "When you need something, you know exactly where to look.",
            ],
          ].map(([number, heading, text]) => (
            <article key={number} className="border-t border-white/20 pt-5">
              <p className="text-sm text-[#c6c16a]">
                <MarketingText scope="shared">{number}</MarketingText>
              </p>
              <h3 className="mt-8 text-xl font-semibold">
                <MarketingText scope="shared">{heading}</MarketingText>
              </h3>
              <p className="mt-3 leading-relaxed text-white/65">
                <MarketingText scope="shared">{text}</MarketingText>
              </p>
            </article>
          ))}
        </div>
      </section>
    </SitePage>
  );
}
