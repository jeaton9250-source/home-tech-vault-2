import {
  MarketingText,
  MarketingImg,
} from "@/components/marketing/MarketingContent";
import type { HomepageContent } from "@/lib/cms/schema";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import HomeMarketingFooter from "@/components/marketing/HomeMarketingFooter";
import {
  ArrowUpRight,
  FileText,
  Home,
  ShieldCheck,
  Wrench,
  CalendarDays,
} from "lucide-react";
const moments = [
  {
    icon: Wrench,
    title: "When something breaks",
    text: "Find the model, manual, receipt and warranty fast.",
  },
  {
    icon: CalendarDays,
    title: "When something needs service",
    text: "See what was done before and when it was last handled.",
  },
  {
    icon: ShieldCheck,
    title: "When you need proof",
    text: "Keep documents, serial numbers and receipts together.",
  },
  {
    icon: Home,
    title: "When you sell your home",
    text: "Pass along the story and records that belong with it.",
  },
];
export default function HomeMarketingView({
  content,
}: {
  content: HomepageContent;
}) {
  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#12233a]">
      <MarketingHeader />
      {content.announcement && (
        <div className="bg-[#142438] py-3 text-center text-xs text-white">
          {content.announcement}
        </div>
      )}

      <section
        id="top"
        className="relative min-h-[720px] overflow-hidden lg:min-h-[calc(100vh-106px)]"
      >
        <MarketingImg
          fetchPriority="high"
          src={content.heroImage}
          alt="Bright modern home interior"
          className="absolute inset-0 h-full w-full object-cover"
          scope="components/marketing/HomeMarketingView.tsx"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5f2eb]/95 via-[#f5f2eb]/75 to-transparent lg:w-[72%]" />
        <div className="relative mx-auto flex min-h-[720px] max-w-[1320px] items-center px-6 py-24 lg:min-h-[calc(100vh-106px)] lg:px-10">
          <div className="max-w-[590px]">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm shadow-sm">
              <Home className="h-4 w-4" />
              <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                {"Built for the place you call home"}
              </MarketingText>
            </div>
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-[#b0a83b]">
              {content.eyebrow}
            </p>
            <h1 className="font-serif text-6xl leading-[0.92] tracking-[-0.055em] text-[#18283b] sm:text-7xl lg:text-[100px]">
              {content.headline.split("\n").map((line, index) => (
                <span className="block" key={index}>
                  <MarketingText scope="shared">{line}</MarketingText>
                </span>
              ))}
            </h1>
            <p className="mt-8 max-w-[540px] text-lg leading-relaxed text-[#304054]">
              {content.description}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href={content.primaryLink}
                className="rounded-full bg-[#18283b] px-7 py-3.5 font-semibold text-white"
              >
                {content.primaryLabel}{" "}
                <ArrowUpRight className="ml-1 inline h-4 w-4" />
              </a>
              <a
                href="/demo"
                className="font-semibold text-[#18283b] underline decoration-[#b6b53d] decoration-2 underline-offset-4"
              >
                <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                  {"See How It Works"}
                </MarketingText>
              </a>
            </div>
            <p className="mt-5 text-sm text-[#304054]/70">
              <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                {"Free to start. No credit card required."}
              </MarketingText>
            </p>
            {content.showAppStore && (
              <a
                href={content.appStoreLink}
                className="mt-5 inline-block rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#18283b]"
                aria-label="Download Home Tech Vault on the App Store"
              >
                <img
                  src="/images/app-store-badge.svg"
                  alt="Download on the App Store"
                  width={180}
                  height={60}
                  className="h-[60px] w-[180px]"
                />
              </a>
            )}
          </div>
        </div>
      </section>

      <section
        id="memory"
        className="bg-[#18283b] px-6 py-24 text-[#f5f2eb] lg:px-10 lg:py-32"
      >
        <div className="mx-auto max-w-[1180px]">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#c6c16a]">
            <MarketingText scope="components/marketing/HomeMarketingView.tsx">
              {"The home binder, reimagined"}
            </MarketingText>
          </p>
          <h2 className="max-w-3xl font-serif text-5xl leading-none tracking-[-0.05em] md:text-7xl">
            <MarketingText scope="components/marketing/HomeMarketingView.tsx">
              {"Every home comes"}
            </MarketingText>
            <br />
            <MarketingText scope="components/marketing/HomeMarketingView.tsx">
              {"with paperwork."}
            </MarketingText>
          </h2>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/65">
            <MarketingText scope="components/marketing/HomeMarketingView.tsx">
              {
                "Manuals in drawers. Receipts in email. Warranty cards in boxes. Maintenance dates somewhere in your head."
              }
            </MarketingText>
          </p>
          <p className="mt-4 text-lg text-[#f5f2eb]">
            <MarketingText scope="components/marketing/HomeMarketingView.tsx">
              {"There should be one place for all of it."}
            </MarketingText>
          </p>
          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-5">
            <div className="bg-[#20344b] p-6">
              <FileText className="mb-10 h-5 w-5 text-[#c6c16a]" />
              <p>
                <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                  {"Manuals"}
                </MarketingText>
              </p>
            </div>
            <div className="bg-[#20344b] p-6">
              <FileText className="mb-10 h-5 w-5 text-[#c6c16a]" />
              <p>
                <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                  {"Receipts"}
                </MarketingText>
              </p>
            </div>
            <div className="bg-[#20344b] p-6">
              <ShieldCheck className="mb-10 h-5 w-5 text-[#c6c16a]" />
              <p>
                <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                  {"Warranties"}
                </MarketingText>
              </p>
            </div>
            <div className="bg-[#20344b] p-6">
              <CalendarDays className="mb-10 h-5 w-5 text-[#c6c16a]" />
              <p>
                <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                  {"Maintenance"}
                </MarketingText>
              </p>
            </div>
            <div className="bg-[#20344b] p-6">
              <FileText className="mb-10 h-5 w-5 text-[#c6c16a]" />
              <p>
                <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                  {"Documents"}
                </MarketingText>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="explore" className="px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1180px]">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#a09b31]">
            <MarketingText scope="components/marketing/HomeMarketingView.tsx">
              {"Made for real life"}
            </MarketingText>
          </p>
          <h2 className="font-serif text-5xl leading-none tracking-[-0.05em] md:text-7xl">
            <MarketingText scope="components/marketing/HomeMarketingView.tsx">
              {"Real life happens at home."}
            </MarketingText>
          </h2>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#536174]">
            <MarketingText scope="components/marketing/HomeMarketingView.tsx">
              {
                "Home Tech Vault is there for the moments when knowing your home matters most."
              }
            </MarketingText>
          </p>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {moments.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-2xl border border-[#d8d5cc] bg-[#faf8f3] p-7"
              >
                <Icon className="mb-16 h-6 w-6 text-[#a09b31]" />
                <h3 className="text-xl font-semibold">
                  <MarketingText scope="shared">{title}</MarketingText>
                </h3>
                <p className="mt-3 leading-relaxed text-[#536174]">
                  <MarketingText scope="shared">{text}</MarketingText>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="story" className="bg-[#e8e4d9] px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#a09b31]">
              <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                {"More than storage"}
              </MarketingText>
            </p>
            <h2 className="font-serif text-5xl leading-none tracking-[-0.05em] md:text-7xl">
              <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                {"The record"}
              </MarketingText>
              <br />
              <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                {"of your home."}
              </MarketingText>
            </h2>
          </div>
          <div>
            <p className="max-w-lg text-lg leading-relaxed text-[#536174]">
              <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                {"A clearer history for everything your home has been through."}
              </MarketingText>
            </p>
            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 border-t border-[#bdb8ab] pt-5 text-sm">
              <div>
                <strong className="block font-serif text-3xl">
                  <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                    {"2026"}
                  </MarketingText>
                </strong>
                <span>
                  <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                    {"Home purchased"}
                  </MarketingText>
                </span>
              </div>
              <div>
                <strong className="block font-serif text-3xl">
                  <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                    {"2027"}
                  </MarketingText>
                </strong>
                <span>
                  <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                    {"Refrigerator installed"}
                  </MarketingText>
                </span>
              </div>
              <div>
                <strong className="block font-serif text-3xl">
                  <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                    {"2028"}
                  </MarketingText>
                </strong>
                <span>
                  <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                    {"HVAC serviced"}
                  </MarketingText>
                </span>
              </div>
              <div>
                <strong className="block font-serif text-3xl">
                  <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                    {"2029"}
                  </MarketingText>
                </strong>
                <span>
                  <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                    {"Washer replaced"}
                  </MarketingText>
                </span>
              </div>
              <div>
                <strong className="block font-serif text-3xl">
                  <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                    {"2030"}
                  </MarketingText>
                </strong>
                <span>
                  <MarketingText scope="components/marketing/HomeMarketingView.tsx">
                    {"Roof documentation added"}
                  </MarketingText>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#e8e4d9] px-6 py-24">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="whitespace-pre-line font-serif text-5xl">
            {content.finalHeadline}
          </h2>
          <p className="mt-6 max-w-xl text-lg text-[#536174]">
            {content.finalDescription}
          </p>
          <a
            href={content.primaryLink}
            className="mt-8 inline-block rounded-full bg-[#18283b] px-7 py-3.5 font-semibold text-white"
          >
            {content.primaryLabel}
          </a>
        </div>
      </section>
      <HomeMarketingFooter />
    </main>
  );
}
