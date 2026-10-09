import {
  MarketingText,
  MarketingImg,
} from "@/components/marketing/MarketingContent";
import { SitePage } from "@/components/marketing/RedesignSitePage";
export default function OurStoryPage() {
  return (
    <SitePage
      eyebrow="OUR STORY"
      title={
        <>
          <MarketingText scope="app/our-story/page.tsx">
            {"I built HTV because"}
          </MarketingText>
          <br />
          <MarketingText scope="app/our-story/page.tsx">
            {"homes deserve a memory."}
          </MarketingText>
        </>
      }
      intro="Home Tech Vault started with a simple frustration: important information about a home was everywhere, except where you actually needed it."
    >
      <div className="mt-12 overflow-hidden rounded-2xl">
        <MarketingImg
          width={1536}
          height={1024}
          loading="lazy"
          src="/images/home-tech-vault-hero.png"
          alt="Warm modern home interior with a curved staircase and large windows"
          className="h-[320px] w-full object-cover md:h-[460px]"
          scope="app/our-story/page.tsx"
        />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="/signup"
          className="rounded-full bg-[#18283b] px-6 py-3 font-semibold text-white"
        >
          <MarketingText scope="app/our-story/page.tsx">
            {"Start Your Home"}
          </MarketingText>
        </a>
        <a
          href="/explore"
          className="rounded-full border border-[#18283b]/20 px-6 py-3 font-semibold"
        >
          <MarketingText scope="app/our-story/page.tsx">
            {"Explore HTV"}
          </MarketingText>
        </a>
      </div>
      <section
        id="started"
        className="mt-24 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a09b31]">
            <MarketingText scope="app/our-story/page.tsx">
              {"WHERE IT STARTED"}
            </MarketingText>
          </p>
          <h2 className="mt-5 font-serif text-5xl leading-none">
            <MarketingText scope="app/our-story/page.tsx">
              {"The information existed, but it was scattered."}
            </MarketingText>
          </h2>
        </div>
        <div className="space-y-5 text-lg leading-relaxed text-[#536174]">
          <p>
            <MarketingText scope="app/our-story/page.tsx">
              {
                "Manuals ended up in drawers. Receipts lived in email. Warranty information got lost. Service dates were written down somewhere \u2014 or not at all."
              }
            </MarketingText>
          </p>
          <p>
            <MarketingText scope="app/our-story/page.tsx">
              {
                "I started thinking about how much history a home quietly builds over time. Appliances get replaced. Systems get serviced. Rooms get updated. Documents get signed. Every year adds another layer."
              }
            </MarketingText>
          </p>
          <p>
            <MarketingText scope="app/our-story/page.tsx">
              {"What if the home itself had one place to remember it all?"}
            </MarketingText>
          </p>
        </div>
      </section>
      <section className="mt-24 rounded-2xl bg-[#18283b] p-8 text-[#f5f2eb] md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c6c16a]">
          <MarketingText scope="app/our-story/page.tsx">
            {"WHY IT MATTERS"}
          </MarketingText>
        </p>
        <h2 className="mt-5 max-w-2xl font-serif text-5xl leading-none">
          <MarketingText scope="app/our-story/page.tsx">
            {"HTV is meant to make homeownership feel a little easier."}
          </MarketingText>
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-xl font-semibold">
              <MarketingText scope="app/our-story/page.tsx">
                {"Less searching"}
              </MarketingText>
            </h3>
            <p className="mt-3 text-white/65">
              <MarketingText scope="app/our-story/page.tsx">
                {
                  "Know where to look when you need a manual, receipt, warranty or service record."
                }
              </MarketingText>
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">
              <MarketingText scope="app/our-story/page.tsx">
                {"More confidence"}
              </MarketingText>
            </h3>
            <p className="mt-3 text-white/65">
              <MarketingText scope="app/our-story/page.tsx">
                {
                  "Keep a clearer record of what your home owns, what was done, and when."
                }
              </MarketingText>
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">
              <MarketingText scope="app/our-story/page.tsx">
                {"A history that stays"}
              </MarketingText>
            </h3>
            <p className="mt-3 text-white/65">
              <MarketingText scope="app/our-story/page.tsx">
                {
                  "Build a useful home record that can grow with the property over time."
                }
              </MarketingText>
            </p>
          </div>
        </div>
      </section>
      <section className="mt-24 grid items-center gap-10 border-t border-[#c9c5b9] pt-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="max-w-2xl font-serif text-4xl leading-none md:text-6xl">
            <MarketingText scope="app/our-story/page.tsx">
              {
                "\u201CHTV is still growing, but the goal has stayed simple: make the information that comes with owning a home easier to keep, easier to find, and more useful over time.\u201D"
              }
            </MarketingText>
          </p>
          <p className="mt-6 text-sm text-[#536174]">
            <MarketingText scope="app/our-story/page.tsx">
              {"Jason Eaton \u00B7 Founder, Home Tech Vault"}
            </MarketingText>
          </p>
        </div>
        <MarketingImg
          src="/images/jason-eaton.jpg"
          alt="Jason Eaton, founder of Home Tech Vault"
          width={600}
          height={750}
          loading="lazy"
          className="aspect-[4/5] w-full max-w-md rounded-2xl object-cover object-[50%_12%] lg:justify-self-end"
          scope="app/our-story/page.tsx"
        />
      </section>
    </SitePage>
  );
}
