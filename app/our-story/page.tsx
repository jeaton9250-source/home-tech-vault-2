import MarketingPageShell from "@/components/marketing/MarketingPageShell";
import {
  PrimaryMarketingButton,
  SecondaryMarketingButton,
} from "@/components/marketing/MarketingButtons";

export default function OurStoryPage() {
  return (
    <MarketingPageShell
      eyebrow="Our Story"
      title={
        <>
          Homes remember.
          <br />
          We should too.
        </>
      }
      description={
        <>
          Home Tech Vault started with a simple
          idea: owning a home creates years of
          useful information, but almost none of
          it has a good place to live.
        </>
      }
      actions={
        <>
          <PrimaryMarketingButton href="/signup">
            Start Your Home
          </PrimaryMarketingButton>

          <SecondaryMarketingButton href="/explore">
            Explore HTV
          </SecondaryMarketingButton>
        </>
      }
      visual={
        <div className="overflow-hidden rounded-[36px]">
          <img
            src="https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1400&q=90"
            alt="A welcoming home"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      }
    >
      <section className="px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-[1200px] gap-16 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7c8793]">
              Why HTV exists
            </p>
          </div>

          <div>
            <h2 className="font-serif text-4xl leading-[1.1] tracking-[-0.04em] sm:text-5xl">
              Your home&apos;s useful history
              shouldn&apos;t disappear into
              drawers, inboxes and filing cabinets.
            </h2>

            <div className="mt-8 space-y-6 text-lg leading-8 text-[#687486]">
              <p>
                Homes accumulate information over
                years — appliances, repairs,
                upgrades, warranties, receipts,
                service records and documents.
              </p>

              <p>
                The problem is that those details
                usually end up scattered everywhere.
                Home Tech Vault gives them one place
                to stay connected to the home they
                belong to.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
