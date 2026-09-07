import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  Gift,
  Home,
  KeyRound,
  PackageCheck,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import MarketingHeader from "@/components/marketing/MarketingHeader";

const homeDetails = [
  "Appliances",
  "Manuals",
  "Warranties",
  "Paint colors",
  "Service history",
  "Important documents",
  "Maintenance information",
  "Home notes",
];

const steps = [
  {
    number: "01",
    title: "Start the home",
    copy: "Add the property before closing and begin building its useful record.",
  },
  {
    number: "02",
    title: "Add what matters",
    copy: "Organize appliances, warranties, manuals, documents and the details your buyer will want later.",
  },
  {
    number: "03",
    title: "Hand over the keys",
    copy: "Transfer the completed home record to your buyer when the home changes hands.",
  },
];

const realtorBenefits = [
  {
    title: "Useful after closing",
    copy: "Your gift keeps helping after the boxes are unpacked and closing day is over.",
  },
  {
    title: "Your name stays remembered",
    copy: "Give clients something connected to one of the biggest purchases they will ever make.",
  },
  {
    title: "No subscription to manage",
    copy: "Create your Realtor account for free and gift homes when it makes sense for your business.",
  },
];

export default function RealtorsPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#152335]">
      <MarketingHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#152335]/[0.06]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-0 h-[520px] w-[520px] rounded-full bg-white/80 blur-[120px]" />
          <div className="absolute -right-24 top-16 h-[520px] w-[520px] rounded-full bg-[#dfeaec]/70 blur-[130px]" />
        </div>

        <div className="relative mx-auto grid max-w-[1380px] items-center gap-16 px-5 py-20 sm:px-6 lg:min-h-[720px] lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-24">
          {/* LEFT */}
          <div className="max-w-[720px]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#788594]">
              Home Tech Vault for Realtors
            </p>

            <h1 className="mt-6 max-w-[720px] font-serif text-[52px] leading-[0.98] tracking-[-0.055em] sm:text-[68px] lg:text-[80px]">
              Give your buyers
              <br />
              something that stays
              <br />
              with the home.
            </h1>

            <p className="mt-8 max-w-[650px] text-lg leading-8 text-[#647284] sm:text-xl">
              A beautifully organized record of their new home —
              appliances, warranties, documents, maintenance details
              and more — ready for them when they get the keys.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/realtors/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#152335] px-7 py-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#23384c]"
              >
                Create a Buyer Home
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#buyer-experience"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#152335]/10 bg-white/55 px-7 py-4 text-sm font-semibold text-[#152335] backdrop-blur transition hover:bg-white"
              >
                See the experience
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#687587]">
              {[
                "Free to join",
                "Pay when you gift",
                "1 year of Pro included",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#66733f]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PREMIUM CLOSING HANDOFF */}
          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute -inset-10 rounded-full bg-white/40 blur-3xl" />

            <div className="relative rotate-[1deg] rounded-[34px] border border-white/80 bg-white/75 p-4 shadow-[0_40px_100px_rgba(22,35,53,0.13)] backdrop-blur-xl sm:p-5">
              <div className="overflow-hidden rounded-[27px] bg-[#162638]">
                <div className="border-b border-white/[0.08] px-7 py-6 sm:px-9">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08]">
                        <Home className="h-4 w-4 text-white/75" />
                      </div>

                      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                        Home record
                      </span>
                    </div>

                    <span className="rounded-full bg-white/[0.07] px-3 py-1.5 text-[10px] font-medium text-white/55">
                      Ready for closing
                    </span>
                  </div>
                </div>

                <div className="px-7 py-9 sm:px-9 sm:py-10">
                  <p className="text-xs text-white/45">Prepared home</p>

                  <h2 className="mt-2 font-serif text-3xl tracking-[-0.03em] text-white sm:text-[38px]">
                    1247 Willow Creek Lane
                  </h2>

                  <div className="mt-9 border-t border-white/[0.08] pt-7">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                      Prepared for
                    </p>

                    <p className="mt-2 text-lg font-medium text-white">
                      Sarah &amp; Michael
                    </p>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5">
                    {[
                      "Appliances",
                      "Warranties",
                      "Manuals",
                      "Documents",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2.5 text-sm text-white/70"
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#a5aa4a]/20">
                          <Check className="h-3 w-3 text-[#c7cb70]" />
                        </div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#f1efe8] px-7 py-7 text-[#152335] sm:px-9">
                  <div className="flex items-end justify-between gap-6">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7b8590]">
                        A gift from
                      </p>
                      <p className="mt-2 font-serif text-2xl">
                        Your Realtor
                      </p>
                      <p className="mt-1 text-xs text-[#77828d]">
                        Includes 1 year of Home Tech Vault Pro
                      </p>
                    </div>

                    <Gift className="h-6 w-6 text-[#556578]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-6 hidden rounded-[20px] border border-[#152335]/[0.06] bg-white px-5 py-4 shadow-xl lg:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b949d]">
                Closing day
              </p>
              <p className="mt-1 font-serif text-lg">
                Ready to hand over.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MORE THAN A CLOSING GIFT */}
      <section className="px-5 py-24 sm:px-6 lg:px-10 lg:py-36">
        <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#89939d]">
              More than a closing gift
            </p>

            <div className="mt-7 font-serif text-[46px] leading-[1.03] tracking-[-0.045em] sm:text-[62px] lg:text-[72px]">
              <p>Flowers disappear.</p>
              <p className="text-[#89939d]">Gift baskets get used.</p>
              <p>The home stays.</p>
            </div>
          </div>

          <div className="lg:pb-2">
            <p className="max-w-[480px] text-lg leading-8 text-[#667486]">
              Home Tech Vault gives your clients something they can
              keep using long after closing day — a dependable place
              for the details that come with owning their home.
            </p>

            <div className="mt-8 h-px w-full bg-[#152335]/10" />

            <p className="mt-8 max-w-[470px] text-sm leading-7 text-[#7a8592]">
              Not another piece of software to manage. A useful record
              that begins with the property and becomes more valuable
              the longer they own it.
            </p>
          </div>
        </div>
      </section>

      {/* BUYER EXPERIENCE */}
      <section
        id="buyer-experience"
        className="scroll-mt-[90px] bg-[#ebe9e3] px-5 py-24 sm:px-6 lg:px-10 lg:py-32"
      >
        <div className="mx-auto grid max-w-[1240px] gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          {/* LIST */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7f8b96]">
              What the buyer gets
            </p>

            <h2 className="mt-5 max-w-[580px] font-serif text-5xl leading-[1.04] tracking-[-0.045em] sm:text-6xl">
              Their home,
              <br />
              already organized.
            </h2>

            <p className="mt-7 max-w-[520px] text-lg leading-8 text-[#657386]">
              Give your buyer a head start by putting the most useful
              information about their home in one place.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-x-8">
              {homeDetails.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 border-t border-[#152335]/10 py-4 text-sm font-medium"
                >
                  <Check className="h-4 w-4 text-[#6c7641]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* HOME RECORD VISUAL */}
          <div className="rounded-[34px] bg-[#152638] p-6 shadow-[0_32px_80px_rgba(20,35,52,0.14)] sm:p-8">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  1247 Willow Creek Lane
                </p>
                <h3 className="mt-2 font-serif text-3xl text-white">
                  The home at a glance
                </h3>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.07]">
                <Home className="h-5 w-5 text-white/70" />
              </div>
            </div>

            <div className="mt-8 space-y-2">
              {[
                {
                  icon: PackageCheck,
                  title: "Kitchen appliances",
                  detail: "Models, serial numbers & manuals",
                },
                {
                  icon: ShieldCheck,
                  title: "Warranties",
                  detail: "Coverage kept with the item",
                },
                {
                  icon: FileText,
                  title: "Home documents",
                  detail: "Important files in one place",
                },
                {
                  icon: Wrench,
                  title: "Maintenance",
                  detail: "A useful history of the home",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 rounded-[18px] border border-white/[0.06] bg-white/[0.035] px-5 py-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                      <Icon className="h-4 w-4 text-[#c4c971]" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex items-center justify-between rounded-[20px] bg-[#f3f1eb] px-5 py-5 text-[#152335]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#87909a]">
                  Buyer access
                </p>
                <p className="mt-1 font-serif text-xl">
                  Ready when they are.
                </p>
              </div>

              <KeyRound className="h-5 w-5" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="scroll-mt-[90px] px-5 py-24 sm:px-6 lg:px-10 lg:py-36"
      >
        <div className="mx-auto max-w-[1120px]">
          <div className="grid gap-10 border-b border-[#152335]/10 pb-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#89939d]">
                How it works
              </p>

              <h2 className="mt-5 font-serif text-5xl leading-[1.02] tracking-[-0.045em] sm:text-6xl">
                From contract
                <br />
                to closing.
              </h2>
            </div>

            <p className="max-w-[520px] self-end text-lg leading-8 text-[#667486]">
              Build the home record while the transaction is moving,
              then hand it over when your buyer gets the keys.
            </p>
          </div>

          <div>
            {steps.map((step) => (
              <div
                key={step.number}
                className="grid gap-5 border-b border-[#152335]/10 py-10 sm:grid-cols-[110px_0.8fr_1.2fr] sm:items-start lg:py-12"
              >
                <span className="font-serif text-3xl text-[#152335]/25">
                  {step.number}
                </span>

                <h3 className="font-serif text-3xl tracking-[-0.025em]">
                  {step.title}
                </h3>

                <p className="max-w-[500px] leading-7 text-[#697687]">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REALTOR VALUE */}
      <section className="bg-white px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto max-w-[820px] text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a949f]">
              After closing
            </p>

            <h2 className="mt-5 font-serif text-5xl leading-[1.03] tracking-[-0.045em] sm:text-6xl">
              Be remembered for more
              <br className="hidden sm:block" />
              than the transaction.
            </h2>

            <p className="mx-auto mt-7 max-w-[680px] text-lg leading-8 text-[#667486]">
              Give buyers something they will reach for when they need
              the dishwasher model number, an HVAC warranty, a manual
              or the details that came with their new home.
            </p>
          </div>

          <div className="mt-16 grid border-y border-[#152335]/10 lg:grid-cols-3">
            {realtorBenefits.map((item, index) => (
              <div
                key={item.title}
                className={[
                  "py-9 lg:px-9 lg:py-11",
                  index !== 0 ? "border-t border-[#152335]/10 lg:border-l lg:border-t-0" : "",
                ].join(" ")}
              >
                <span className="font-serif text-2xl text-[#152335]/20">
                  0{index + 1}
                </span>

                <h3 className="mt-8 font-serif text-2xl tracking-[-0.02em]">
                  {item.title}
                </h3>

                <p className="mt-4 max-w-[330px] leading-7 text-[#697687]">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HANDOFF EXPERIENCE */}
      <section className="bg-[#e8eceb] px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7b8893]">
              The handoff
            </p>

            <h2 className="mt-5 max-w-[520px] font-serif text-5xl leading-[1.03] tracking-[-0.045em] sm:text-6xl">
              Make closing day feel considered.
            </h2>

            <p className="mt-7 max-w-[500px] text-lg leading-8 text-[#657386]">
              The buyer receives their home record as part of the
              handoff — prepared, useful and ready to grow with them.
            </p>
          </div>

          <div className="rounded-[34px] bg-[#faf8f3] p-5 shadow-[0_30px_80px_rgba(20,35,52,0.08)] sm:p-8">
            <div className="rounded-[27px] border border-[#152335]/[0.07] bg-white px-7 py-9 sm:px-10 sm:py-11">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf0e6]">
                <KeyRound className="h-5 w-5 text-[#65703e]" />
              </div>

              <p className="mt-9 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a949f]">
                Welcome home
              </p>

              <h3 className="mt-3 font-serif text-4xl leading-[1.08] tracking-[-0.035em]">
                We organized the details
                <br />
                so you don&apos;t have to.
              </h3>

              <p className="mt-6 max-w-[520px] leading-7 text-[#697687]">
                Your Home Tech Vault has been prepared for
                1247 Willow Creek Lane. Everything your Realtor
                added is waiting for you.
              </p>

              <div className="mt-9 border-t border-[#152335]/10 pt-6">
                <p className="text-sm font-semibold">
                  A housewarming gift from your Realtor
                </p>

                <p className="mt-1 text-sm text-[#82909b]">
                  Includes one year of Home Tech Vault Pro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#142437] px-5 py-24 text-white sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto flex max-w-[900px] flex-col items-center text-center">
          <Gift className="h-7 w-7 text-white/45" />

          <h2 className="mt-7 font-serif text-5xl leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Make the home part
            <br />
            of the closing gift.
          </h2>

          <p className="mt-7 max-w-[620px] text-lg leading-8 text-white/55">
            Create your Realtor account and prepare your first buyer
            home when you&apos;re ready.
          </p>

          <Link
            href="/realtors/signup"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#f3f1e9] px-8 py-4 text-sm font-semibold text-[#152335] transition duration-200 hover:-translate-y-0.5 hover:bg-white"
          >
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>

          <p className="mt-5 text-xs text-white/35">
            Free to join · Pay when you gift
          </p>
        </div>
      </section>
    </main>
  );
}
