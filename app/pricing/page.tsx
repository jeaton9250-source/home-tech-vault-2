import MarketingPageShell from "@/components/marketing/MarketingPageShell";
import {
  PrimaryMarketingButton,
  SecondaryMarketingButton,
} from "@/components/marketing/MarketingButtons";

export default function PricingPage() {
  return (
    <MarketingPageShell
      eyebrow="Simple Pricing"
      title={
        <>
          A better record
          <br />
          for your home.
        </>
      }
      description={
        <>
          Start free, organize what matters,
          and upgrade when you want more room
          for your home&apos;s history.
        </>
      }
      actions={
        <>
          <PrimaryMarketingButton href="/signup">
            Start Free
          </PrimaryMarketingButton>

          <SecondaryMarketingButton href="/what-it-remembers">
            See What HTV Remembers
          </SecondaryMarketingButton>
        </>
      }
    >
      {/* PUT YOUR CURRENT PRICING CARDS HERE */}
    </MarketingPageShell>
  );
}
