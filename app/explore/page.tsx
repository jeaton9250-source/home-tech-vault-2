import MarketingPageShell from "@/components/marketing/MarketingPageShell";
import {
  PrimaryMarketingButton,
  SecondaryMarketingButton,
} from "@/components/marketing/MarketingButtons";

export default function ExplorePage() {
  return (
    <MarketingPageShell
      eyebrow="Explore Home Tech Vault"
      title={
        <>
          See your home
          <br />
          differently.
        </>
      }
      description={
        <>
          Explore how Home Tech Vault brings
          the useful details of your home
          together — without turning your home
          into another complicated system.
        </>
      }
      actions={
        <>
          <PrimaryMarketingButton href="/signup">
            Start Your Home
          </PrimaryMarketingButton>

          <SecondaryMarketingButton href="/what-it-remembers">
            What It Remembers
          </SecondaryMarketingButton>
        </>
      }
      visual={
        <div className="relative overflow-hidden rounded-[36px] shadow-[0_30px_90px_rgba(29,47,66,0.14)]">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=90"
            alt="Modern home interior"
            className="aspect-[4/3] w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#142333]/50 via-transparent to-transparent" />

          <div className="absolute bottom-6 left-6 rounded-[22px] bg-white/90 px-6 py-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-[#75808d]">
              Home record
            </p>

            <p className="mt-2 font-serif text-2xl">
              Everything in its place.
            </p>
          </div>
        </div>
      }
    >
      <section className="px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1380px]">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                number: "01",
                title: "Add what matters",
                copy: "Save appliances, receipts, documents, warranties and maintenance records.",
              },
              {
                number: "02",
                title: "Build the history",
                copy: "Your home record becomes more useful every time something changes.",
              },
              {
                number: "03",
                title: "Find it later",
                copy: "When you need something, you know exactly where to look.",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="rounded-[30px] bg-[#ece9e2] p-9"
              >
                <span className="text-sm font-semibold text-[#8a938e]">
                  {item.number}
                </span>

                <h2 className="mt-12 font-serif text-3xl">
                  {item.title}
                </h2>

                <p className="mt-4 leading-7 text-[#687486]">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
