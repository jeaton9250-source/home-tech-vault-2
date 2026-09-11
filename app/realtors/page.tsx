import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Gift,
  Home,
  KeyRound,
  ReceiptText,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import HomeMarketingFooter from "@/components/marketing/HomeMarketingFooter";
import MarketingHeader from "@/components/marketing/MarketingHeader";

const keepsakeDetails = [
  {
    icon: ReceiptText,
    title: "The things that came with the home",
    copy: "Appliance details, receipts, paint colors and the information buyers usually inherit in a drawer—or not at all.",
  },
  {
    icon: ShieldCheck,
    title: "The protection they will want later",
    copy: "Warranties, manuals and important documents kept beside the part of the home they belong to.",
  },
  {
    icon: Wrench,
    title: "A thoughtful head start",
    copy: "Service notes and maintenance history that help a new owner understand how their home has been cared for.",
  },
] as const;

const handoffSteps = [
  {
    number: "01",
    title: "Choose the home",
    copy: "Create the address and begin its record while the transaction is moving toward closing.",
  },
  {
    number: "02",
    title: "Add the thoughtful details",
    copy: "Include what you have from the listing, seller or builder. A few useful details are enough to make the gift feel personal.",
  },
  {
    number: "03",
    title: "Welcome them home",
    copy: "Present the home record with the keys. Your buyers receive a beautiful starting point that is theirs to keep building.",
  },
] as const;

export default function RealtorsPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#152335]">
      <MarketingHeader />

      <section className="overflow-hidden border-b border-[#152335]/[0.07]">
        <div className="mx-auto grid max-w-[1440px] lg:min-h-[760px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative flex items-center px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28 xl:px-16">
            <div className="pointer-events-none absolute -left-40 top-0 h-[540px] w-[540px] rounded-full bg-white/85 blur-[120px]" />

            <div className="relative max-w-[650px]">
              <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#71805f]">
                <span className="h-px w-8 bg-[#98a267]" />
                A closing gift for the home
              </div>

              <h1 className="mt-7 font-serif text-[54px] leading-[0.94] tracking-[-0.055em] sm:text-[70px] lg:text-[76px] xl:text-[86px]">
                Give them more
                <br />
                than the keys.
              </h1>

              <p className="mt-8 max-w-[590px] text-lg leading-8 text-[#627081] sm:text-xl">
                Welcome your buyers with a beautifully prepared record of
                their new home—useful details, documents and history gathered
                in one place from the very first day.
              </p>

              <p className="mt-6 max-w-[560px] font-serif text-2xl italic leading-9 text-[#384a59]">
                A thoughtful gift for closing day. A useful gift for every day
                after.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/realtors/signup"
                  className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-[#152335] px-8 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#24384c]"
                >
                  Prepare a home gift
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#the-gift"
                  className="inline-flex min-h-[54px] items-center justify-center px-6 text-sm font-semibold text-[#425366] transition hover:text-[#152335]"
                >
                  See what they receive
                </a>
              </div>

              <p className="mt-5 text-sm text-[#7a8592]">
                Free Realtor account · Create a gift when the moment is right
              </p>
            </div>
          </div>

          <div className="relative min-h-[560px] lg:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=90"
              alt="A warm, welcoming home prepared for its new owners"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#152335]/45 via-transparent to-transparent" />

            <div className="absolute inset-x-5 bottom-6 sm:inset-x-auto sm:bottom-9 sm:left-9 sm:w-[430px] lg:-left-7 lg:bottom-12">
              <div className="rotate-[-1deg] border border-white/70 bg-[#faf7ef]/95 p-3 shadow-[0_30px_80px_rgba(21,35,53,0.24)] backdrop-blur-sm">
                <div className="border border-[#152335]/12 px-7 py-7 sm:px-9 sm:py-8">
                  <div className="flex items-center justify-between">
                    <Home className="h-5 w-5 text-[#768052]" />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#89918a]">
                      Welcome home
                    </span>
                  </div>

                  <p className="mt-10 font-serif text-[34px] leading-[1.02] tracking-[-0.04em]">
                    The Collins Home
                  </p>
                  <p className="mt-2 text-sm text-[#6d7881]">
                    24 Hawthorne Lane
                  </p>

                  <div className="mt-8 border-t border-[#152335]/10 pt-5">
                    <p className="font-serif text-lg italic text-[#3f4e59]">
                      May this home hold years of wonderful memories.
                    </p>
                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#818a91]">
                      Prepared with care by your Realtor
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
        <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#849086]">
              A gift with a longer life
            </p>

            <h2 className="mt-6 max-w-[760px] font-serif text-[48px] leading-[1] tracking-[-0.045em] sm:text-[64px] lg:text-[74px]">
              Some gifts celebrate the day.
              <span className="block text-[#87917d]">
                This one helps them feel at home.
              </span>
            </h2>
          </div>

          <div className="max-w-[500px] lg:pb-2">
            <p className="text-lg leading-8 text-[#637183]">
              Long after the flowers fade and the boxes are unpacked, your
              buyers will still need the dishwasher manual, the paint color,
              the HVAC service date or the warranty they forgot they had.
            </p>

            <div className="mt-8 h-px bg-[#152335]/10" />

            <p className="mt-7 font-serif text-2xl italic leading-9 text-[#3b4b59]">
              Home Tech Vault makes your care part of the home they remember.
            </p>
          </div>
        </div>
      </section>

      <section
        id="the-gift"
        className="scroll-mt-[90px] bg-[#e8e7df] px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
      >
        <div className="mx-auto grid max-w-[1240px] gap-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="relative mx-auto w-full max-w-[540px]">
            <div className="absolute -inset-8 rounded-full bg-white/50 blur-3xl" />
            <div className="relative rotate-[1deg] bg-[#17283a] p-4 shadow-[0_36px_90px_rgba(21,35,53,0.18)] sm:p-5">
              <div className="border border-white/10 px-7 py-8 text-white sm:px-10 sm:py-10">
                <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-8">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/40">
                      The home book
                    </p>
                    <h3 className="mt-3 font-serif text-4xl tracking-[-0.04em]">
                      24 Hawthorne Lane
                    </h3>
                  </div>
                  <BookOpen className="h-6 w-6 text-[#c6c96d]" />
                </div>

                <div className="mt-8 space-y-1">
                  {[
                    ["Kitchen & appliances", "12 details saved"],
                    ["Warranties & receipts", "Ready when needed"],
                    ["Home documents", "Kept safely together"],
                    ["Care & maintenance", "History started"],
                  ].map(([title, detail]) => (
                    <div
                      key={title}
                      className="flex items-center justify-between gap-5 border-b border-white/[0.08] py-4"
                    >
                      <span className="text-sm text-white/80">{title}</span>
                      <span className="text-xs text-white/35">{detail}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-9 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c0c45f]/15">
                    <Gift className="h-4 w-4 text-[#d4d678]" />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-white/80">
                      A housewarming gift from your Realtor
                    </p>
                    <p className="mt-1 text-[10px] text-white/35">
                      Ready for the new owners
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-[610px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7b877e]">
              What they receive
            </p>

            <h2 className="mt-6 font-serif text-5xl leading-[1.02] tracking-[-0.045em] sm:text-6xl">
              A home already cared for.
            </h2>

            <p className="mt-7 max-w-[560px] text-lg leading-8 text-[#627081]">
              Not an empty account or another app to figure out. A welcoming
              home record with useful information already waiting inside.
            </p>

            <div className="mt-10 border-t border-[#152335]/10">
              {keepsakeDetails.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="grid gap-4 border-b border-[#152335]/10 py-7 sm:grid-cols-[44px_1fr]"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f5ef] text-[#6f7950]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-serif text-2xl tracking-[-0.02em]">
                        {item.title}
                      </h3>
                      <p className="mt-2 max-w-[520px] leading-7 text-[#697687]">
                        {item.copy}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#f7f5f0]">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
          <div className="relative min-h-[480px] lg:min-h-[690px]">
            <img
              src="https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1600&q=90"
              alt="Front door and keys ready for a new homeowner"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#152335]/35 via-transparent to-transparent" />
          </div>

          <div className="flex items-center px-5 py-20 sm:px-10 lg:px-16 lg:py-24 xl:px-20">
            <div className="max-w-[590px]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#849086]">
                Made personal by you
              </p>

              <h2 className="mt-6 font-serif text-5xl leading-[1.02] tracking-[-0.045em] sm:text-6xl">
                Your care should be part of the presentation.
              </h2>

              <p className="mt-7 text-lg leading-8 text-[#637183]">
                The home record is prepared for the buyer and presented as a
                gift from their Realtor. It feels considered because it is
                connected to their address, their move and the details of the
                home you helped them find.
              </p>

              <div className="mt-10 border-l-2 border-[#9ba35f] pl-6">
                <p className="font-serif text-2xl italic leading-9 text-[#3c4b58]">
                  “May this home hold years of wonderful memories. I hope this
                  record makes caring for it a little easier.”
                </p>
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7c878e]">
                  Your closing note
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-10 border-b border-[#152335]/10 pb-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#849086]">
                A simple handoff
              </p>
              <h2 className="mt-6 font-serif text-5xl leading-[1.02] tracking-[-0.045em] sm:text-6xl">
                From accepted offer
                <br />
                to welcome home.
              </h2>
            </div>

            <p className="max-w-[550px] text-lg leading-8 text-[#637183]">
              Prepare what you know, present it with pride and let the buyer
              carry the home&apos;s useful story forward.
            </p>
          </div>

          <div>
            {handoffSteps.map((step) => (
              <div
                key={step.number}
                className="grid gap-4 border-b border-[#152335]/10 py-9 sm:grid-cols-[90px_0.9fr_1.25fr] sm:items-start lg:py-11"
              >
                <span className="font-serif text-3xl text-[#8e9870]">
                  {step.number}
                </span>
                <h3 className="font-serif text-3xl tracking-[-0.03em]">
                  {step.title}
                </h3>
                <p className="max-w-[530px] leading-7 text-[#687687]">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#697687]">
              {["Free to join", "Gift when you choose", "A year of Pro included"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#77814e]" />
                    {item}
                  </span>
                ),
              )}
            </div>

            <Link
              href="/realtors/signup"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#152335] underline decoration-[#9ba35f] decoration-2 underline-offset-8"
            >
              Create your Realtor account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#17283a] px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto flex max-w-[940px] flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
            <KeyRound className="h-6 w-6 text-[#c9cc72]" />
          </span>

          <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">
            For the moment the keys change hands
          </p>

          <h2 className="mt-5 font-serif text-5xl leading-[1] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Give a better
            <br />
            welcome home.
          </h2>

          <p className="mt-7 max-w-[620px] text-lg leading-8 text-white/60">
            Create your free Realtor account and prepare a closing gift your
            buyers will still value years from now.
          </p>

          <Link
            href="/realtors/signup"
            className="mt-10 inline-flex min-h-[54px] items-center gap-2 rounded-full bg-[#f7f5ef] px-8 text-sm font-semibold text-[#152335] transition duration-200 hover:-translate-y-0.5 hover:bg-white"
          >
            Prepare your first home gift
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <HomeMarketingFooter />
    </main>
  );
}
