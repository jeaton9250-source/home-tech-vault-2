"use client";
import { MarketingText } from "@/components/marketing/MarketingContent";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileSearch,
  FileText,
  FolderOpen,
  Home,
  Laptop,
  Receipt,
  Router,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
  Wrench,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
const ease = [0.22, 1, 0.36, 1] as const;
export default function FeaturesPageContent() {
  return (
    <main className="overflow-hidden bg-[#f6f2ea]">
      {/* ================================================== */}
      {/* HERO */}
      {/* ================================================== */}

      <section className="relative isolate overflow-hidden px-5 pb-28 pt-24 md:px-8 md:pb-36 md:pt-32 lg:px-12">
        <div className="pointer-events-none absolute left-1/2 top-[-450px] -z-10 h-[1000px] w-[1300px] -translate-x-1/2 rounded-full bg-white/85 blur-[150px]" />

        <div className="pointer-events-none absolute right-[-180px] top-[240px] -z-10 h-[500px] w-[500px] rounded-full bg-[#718d4f]/8 blur-[100px]" />

        <div className="mx-auto max-w-[1180px] text-center">
          <Reveal>
            <Eyebrow>
              <Sparkles size={13} />
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {"Everything inside the Vault"}
              </MarketingText>
            </Eyebrow>

            <h1 className="mx-auto mt-8 max-w-[1050px] font-serif text-[clamp(58px,7vw,104px)] font-medium leading-[0.9] tracking-[-0.065em] text-[#17212a]">
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {"Everything your home"}
              </MarketingText>
              <br />
              <span className="text-[#617c43]">
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {"wants you to remember."}
                </MarketingText>
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-[720px] text-[18px] leading-8 text-[#707a75] md:text-[20px]">
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {
                  "Home Tech Vault brings devices, paperwork, warranties, maintenance, Home Wi-Fi and household information together in one thoughtful home record."
                }
              </MarketingText>
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <PrimaryLink href="/signup">
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {"Start My Home Vault"}
                </MarketingText>
                <ArrowRight size={16} />
              </PrimaryLink>

              <SecondaryLink href="/demo">
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {"Explore the Demo"}
                </MarketingText>
              </SecondaryLink>
            </div>
          </Reveal>
        </div>

        <div className="mx-auto mt-20 max-w-[1000px]">
          <FeatureOverview />
        </div>
      </section>

      <FlowDivider />

      {/* ================================================== */}
      {/* DEVICE STORY */}
      {/* ================================================== */}

      <section className="bg-[#fffdf8] px-5 py-28 md:px-8 md:py-40 lg:px-12">
        <div className="mx-auto max-w-[1220px]">
          <div className="grid gap-16 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div>
              <div className="lg:sticky lg:top-28">
                <Reveal>
                  <SectionLabel>
                    <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                      {"Devices"}
                    </MarketingText>
                  </SectionLabel>

                  <h2 className="mt-6 max-w-[550px] font-serif text-[clamp(46px,5vw,72px)] font-medium leading-[0.98] tracking-[-0.05em] text-[#17212a]">
                    <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                      {"Every device gets a home of its own."}
                    </MarketingText>
                  </h2>

                  <p className="mt-7 max-w-[540px] text-lg leading-8 text-[#747e79]">
                    <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                      {
                        "Keep the identity of each appliance and piece of technology beside the information you will need later."
                      }
                    </MarketingText>
                  </p>

                  <div className="mt-9 space-y-3">
                    <CheckLine>
                      <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                        {"Model and serial numbers"}
                      </MarketingText>
                    </CheckLine>

                    <CheckLine>
                      <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                        {"Purchase information"}
                      </MarketingText>
                    </CheckLine>

                    <CheckLine>
                      <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                        {"Room and location"}
                      </MarketingText>
                    </CheckLine>

                    <CheckLine>
                      <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                        {"Photos and notes"}
                      </MarketingText>
                    </CheckLine>

                    <CheckLine>
                      <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                        {"Connected documents"}
                      </MarketingText>
                    </CheckLine>
                  </div>

                  <TextLink href="/devices">
                    <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                      {"Explore Devices"}
                    </MarketingText>
                  </TextLink>
                </Reveal>
              </div>
            </div>

            <div className="space-y-6">
              <LargeDeviceCard />

              <FloatingFeature
                icon={Receipt}
                eyebrow="Purchase"
                title="Everything about the purchase stays nearby."
                copy="Save when you bought it, where you bought it and what you paid."
              />

              <FloatingFeature
                icon={FileText}
                eyebrow="Documentation"
                title="The paperwork stays connected."
                copy="Receipts, manuals and warranty documents belong to the device instead of a random folder."
              />

              <FloatingFeature
                icon={Wrench}
                eyebrow="History"
                title="The story grows over time."
                copy="Maintenance and service history become part of the same useful home record."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* RECORDS / DOCUMENTS */}
      {/* ================================================== */}

      <section className="bg-[#f2eee5] px-5 py-28 md:px-8 md:py-40 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <div className="mx-auto max-w-[820px] text-center">
              <SectionLabel>
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {"Documents"}
                </MarketingText>
              </SectionLabel>

              <h2 className="mt-6 font-serif text-[clamp(46px,5.5vw,76px)] font-medium leading-[0.98] tracking-[-0.055em] text-[#17212a]">
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {"The file cabinet, without the cabinet."}
                </MarketingText>
              </h2>

              <p className="mx-auto mt-7 max-w-[650px] text-lg leading-8 text-[#747e79]">
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {
                    "Keep the useful documents around your home organized by what they actually belong to."
                  }
                </MarketingText>
              </p>
            </div>
          </Reveal>

          <div className="mt-20 grid gap-5 lg:grid-cols-12">
            <motion.div
              whileHover={{
                y: -8,
              }}
              transition={{
                duration: 0.4,
                ease,
              }}
              className="rounded-[38px] bg-[#183047] p-7 text-white shadow-[0_45px_100px_-60px_rgba(24,48,71,0.75)] md:p-10 lg:col-span-7"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b5ca9c]">
                    <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                      {"Digital Vault"}
                    </MarketingText>
                  </p>

                  <h3 className="mt-4 max-w-[500px] font-serif text-4xl leading-[1] tracking-[-0.04em]">
                    <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                      {"The records you need, already where you expect them."}
                    </MarketingText>
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <FolderOpen size={20} />
                </div>
              </div>

              <div className="mt-10 space-y-3">
                <DarkDocumentRow
                  icon={Receipt}
                  title="Best Buy Receipt"
                  detail="Samsung QN90D"
                />

                <DarkDocumentRow
                  icon={FileText}
                  title="QN90D User Manual"
                  detail="Samsung QN90D"
                />

                <DarkDocumentRow
                  icon={ShieldCheck}
                  title="Extended Warranty"
                  detail="Coverage through 2027"
                />

                <DarkDocumentRow
                  icon={Wrench}
                  title="Service Record"
                  detail="Living Room TV"
                />
              </div>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
              <SmallFeatureCard
                icon={FileSearch}
                eyebrow="Find it"
                title="Search instead of digging."
                copy="The receipt or manual is easier to find because it lives in the same system as everything else."
              />

              <SmallFeatureCard
                icon={FolderOpen}
                eyebrow="Keep context"
                title="Files keep their meaning."
                copy="A document is much more useful when you know exactly which appliance or device it belongs to."
              />
            </div>
          </div>

          <div className="mt-10 text-center">
            <TextLink href="/documents">
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {"Explore Documents"}
              </MarketingText>
            </TextLink>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* WARRANTIES */}
      {/* ================================================== */}

      <section className="bg-[#fffdf8] px-5 py-28 md:px-8 md:py-40 lg:px-12">
        <div className="mx-auto grid max-w-[1180px] gap-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <Reveal>
            <div>
              <SectionLabel>
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {"Warranties"}
                </MarketingText>
              </SectionLabel>

              <h2 className="mt-6 max-w-[600px] font-serif text-[clamp(46px,5vw,72px)] font-medium leading-[0.98] tracking-[-0.05em] text-[#17212a]">
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {"Know what is covered before you need it."}
                </MarketingText>
              </h2>

              <p className="mt-7 max-w-[560px] text-lg leading-8 text-[#747e79]">
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {
                    "Track coverage dates, proof of purchase and supporting documents beside the things they protect."
                  }
                </MarketingText>
              </p>

              <div className="mt-9 space-y-3">
                <CheckLine>
                  <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                    {"Active coverage at a glance"}
                  </MarketingText>
                </CheckLine>

                <CheckLine>
                  <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                    {"Expiration dates"}
                  </MarketingText>
                </CheckLine>

                <CheckLine>
                  <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                    {"Proof of purchase"}
                  </MarketingText>
                </CheckLine>

                <CheckLine>
                  <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                    {"Warranty documents"}
                  </MarketingText>
                </CheckLine>
              </div>

              <TextLink href="/warranties">
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {"Explore Warranties"}
                </MarketingText>
              </TextLink>
            </div>
          </Reveal>

          <WarrantyExperience />
        </div>
      </section>

      {/* ================================================== */}
      {/* DARK PRODUCT STATEMENT */}
      {/* ================================================== */}

      <section className="relative isolate overflow-hidden bg-[#183047] px-5 py-36 text-white md:px-8 md:py-48 lg:px-12">
        <div className="pointer-events-none absolute -left-44 -top-44 -z-10 h-[620px] w-[620px] rounded-full bg-[#718d4f]/10 blur-[120px]" />

        <div className="pointer-events-none absolute -bottom-72 -right-32 -z-10 h-[700px] w-[700px] rounded-full bg-white/5 blur-[120px]" />

        <Reveal>
          <div className="mx-auto max-w-[950px] text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b5ca9c]">
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {"Everything works better together"}
              </MarketingText>
            </p>

            <h2 className="mt-7 font-serif text-[clamp(52px,7vw,94px)] font-medium leading-[0.92] tracking-[-0.06em]">
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {"One home."}
              </MarketingText>
              <br />
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {"One memory."}
              </MarketingText>
            </h2>

            <p className="mx-auto mt-8 max-w-[650px] text-lg leading-8 text-white/55">
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {
                  "Devices, records, warranties and maintenance become more valuable when they stop living in separate places."
                }
              </MarketingText>
            </p>
          </div>
        </Reveal>
      </section>

      {/* ================================================== */}
      {/* HOME WI-FI */}
      {/* ================================================== */}

      <section className="bg-[#f6f2ea] px-5 py-28 md:px-8 md:py-40 lg:px-12">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-16 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#e8eedf] px-4 py-2 text-[#617c43]">
                  <Wifi size={14} />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">
                    <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                      {"Home Wi-Fi"}
                    </MarketingText>
                  </span>
                </div>

                <h2 className="mt-7 max-w-[590px] font-serif text-[clamp(46px,5vw,72px)] font-medium leading-[0.98] tracking-[-0.05em] text-[#17212a]">
                  <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                    {"Your network becomes part of the home record."}
                  </MarketingText>
                </h2>

                <p className="mt-7 max-w-[560px] text-lg leading-8 text-[#747e79]">
                  <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                    {
                      "Document your network and use the Connector to help discover devices already connected to your home."
                    }
                  </MarketingText>
                </p>

                <div className="mt-9 space-y-3">
                  <CheckLine>
                    <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                      {"Router and network information"}
                    </MarketingText>
                  </CheckLine>

                  <CheckLine>
                    <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                      {"Connected-device discovery"}
                    </MarketingText>
                  </CheckLine>

                  <CheckLine>
                    <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                      {"Manual scanning included on Free"}
                    </MarketingText>
                  </CheckLine>

                  <CheckLine>
                    <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                      {"One Connector included on Free"}
                    </MarketingText>
                  </CheckLine>

                  <CheckLine>
                    <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                      {"Automatic monitoring on upgraded plans"}
                    </MarketingText>
                  </CheckLine>
                </div>

                <TextLink href="/network">
                  <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                    {"Explore Home Wi-Fi"}
                  </MarketingText>
                </TextLink>
              </div>
            </Reveal>

            <DiscoveryExperience />
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* HOUSEHOLD */}
      {/* ================================================== */}

      <section className="bg-[#fffdf8] px-5 py-28 md:px-8 md:py-40 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <div className="mx-auto max-w-[820px] text-center">
              <SectionLabel>
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {"Household"}
                </MarketingText>
              </SectionLabel>

              <h2 className="mt-6 font-serif text-[clamp(46px,5.5vw,76px)] font-medium leading-[0.98] tracking-[-0.055em] text-[#17212a]">
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {"Useful to everyone. Controlled by you."}
                </MarketingText>
              </h2>

              <p className="mx-auto mt-7 max-w-[660px] text-lg leading-8 text-[#747e79]">
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {
                    "Share the home record with the people who need it without giving everyone the same level of control."
                  }
                </MarketingText>
              </p>
            </div>
          </Reveal>

          <div className="mt-20 grid gap-5 md:grid-cols-4">
            <RoleCard
              title="Owner"
              copy="Full household control, invitations, roles and billing."
            />

            <RoleCard
              title="Admin"
              copy="Helps manage the shared Vault and household information."
            />

            <RoleCard
              title="Member"
              copy="Can view, add and update shared household information."
            />

            <RoleCard
              title="Viewer"
              copy="Can view household information without making changes."
            />
          </div>

          <div className="mt-10 text-center">
            <TextLink href="/family">
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {"Explore Household"}
              </MarketingText>
            </TextLink>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* MAINTENANCE */}
      {/* ================================================== */}

      <section className="bg-[#f2eee5] px-5 py-28 md:px-8 md:py-40 lg:px-12">
        <div className="mx-auto grid max-w-[1180px] gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <MaintenanceTimeline />

          <Reveal>
            <div>
              <SectionLabel>
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {"Maintenance"}
                </MarketingText>
              </SectionLabel>

              <h2 className="mt-6 max-w-[600px] font-serif text-[clamp(46px,5vw,72px)] font-medium leading-[0.98] tracking-[-0.05em] text-[#17212a]">
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {"Remember what happened. Know what comes next."}
                </MarketingText>
              </h2>

              <p className="mt-7 max-w-[560px] text-lg leading-8 text-[#747e79]">
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {
                    "Build a simple service history around the things in your home instead of relying on memory."
                  }
                </MarketingText>
              </p>

              <TextLink href="/maintenance">
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {"Explore Maintenance"}
                </MarketingText>
              </TextLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================== */}
      {/* SEARCH / INTELLIGENCE */}
      {/* ================================================== */}

      <section className="bg-[#183047] px-5 py-28 text-white md:px-8 md:py-40 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[#b5ca9c]">
                  <Search size={14} />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">
                    <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                      {"Ask Your Vault"}
                    </MarketingText>
                  </span>
                </div>

                <h2 className="mt-7 max-w-[620px] font-serif text-[clamp(46px,5vw,72px)] font-medium leading-[0.98] tracking-[-0.05em]">
                  <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                    {"Find what your home already knows."}
                  </MarketingText>
                </h2>

                <p className="mt-7 max-w-[560px] text-lg leading-8 text-white/55">
                  <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                    {
                      "Search across devices, warranties, records and household information instead of remembering where you saved it."
                    }
                  </MarketingText>
                </p>
              </div>

              <SearchExperience />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================== */}
      {/* EVERYTHING TOGETHER */}
      {/* ================================================== */}

      <section className="relative isolate overflow-hidden bg-[#fffdf8] px-5 py-32 md:px-8 md:py-44 lg:px-12">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[750px] w-[1050px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f2eee5] blur-[100px]" />

        <Reveal>
          <div className="mx-auto max-w-[980px] text-center">
            <Home size={24} className="mx-auto text-[#617c43]" />

            <h2 className="mt-8 font-serif text-[clamp(52px,7vw,92px)] font-medium leading-[0.93] tracking-[-0.06em] text-[#17212a]">
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {"It isn't another place to store things."}
              </MarketingText>
              <br />
              <span className="text-[#617c43]">
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {"It's the memory of your home."}
                </MarketingText>
              </span>
            </h2>

            <p className="mx-auto mt-8 max-w-[650px] text-lg leading-8 text-[#747e79]">
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {
                  "Start small. Add what matters. Let Home Tech Vault become more useful as your home changes."
                }
              </MarketingText>
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <PrimaryLink href="/signup">
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {"Start My Home Vault"}
                </MarketingText>
                <ArrowRight size={16} />
              </PrimaryLink>

              <SecondaryLink href="/demo">
                <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                  {"Explore the Demo"}
                </MarketingText>
              </SecondaryLink>
            </div>

            <p className="mt-6 text-xs text-[#949b97]">
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {"Free to start \u00B7 No credit card required"}
              </MarketingText>
            </p>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
/* ====================================================== */
/* VISUAL COMPONENTS */
/* ====================================================== */
function FeatureOverview() {
  return (
    <motion.div
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.4,
        ease,
      }}
      className="rounded-[42px] border border-[#17212a]/8 bg-[#fffdf8]/90 p-5 shadow-[0_45px_110px_-65px_rgba(23,33,42,0.5)] backdrop-blur-xl md:p-7"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewTile
          icon={Laptop}
          label="Devices"
          value="Everything you own"
        />

        <OverviewTile
          icon={FolderOpen}
          label="Documents"
          value="Everything you saved"
        />

        <OverviewTile
          icon={ShieldCheck}
          label="Warranties"
          value="Everything covered"
        />

        <OverviewTile
          icon={Wifi}
          label="Home Wi-Fi"
          value="Everything connected"
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <OverviewTile
          icon={Wrench}
          label="Maintenance"
          value="Everything serviced"
        />

        <OverviewTile
          icon={Users}
          label="Household"
          value="Everyone who needs it"
        />

        <OverviewTile
          icon={Search}
          label="Search"
          value="Everything easy to find"
        />
      </div>
    </motion.div>
  );
}
function OverviewTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Home;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -6,
      }}
      className="rounded-[24px] bg-[#f2eee5] p-5"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6ecde] text-[#617c43]">
        <Icon size={17} />
      </div>

      <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.17em] text-[#718d4f]">
        <MarketingText scope="shared">{label}</MarketingText>
      </p>

      <p className="mt-2 font-serif text-lg text-[#183047]">
        <MarketingText scope="shared">{value}</MarketingText>
      </p>
    </motion.div>
  );
}
function LargeDeviceCard() {
  return (
    <motion.div
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.4,
        ease,
      }}
      className="rounded-[38px] border border-[#17212a]/8 bg-[#f6f2ea] p-7 shadow-[0_38px_100px_-65px_rgba(23,33,42,0.45)] md:p-10"
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
            <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
              {"Living Room"}
            </MarketingText>
          </p>

          <h3 className="mt-3 font-serif text-4xl tracking-[-0.04em] text-[#17212a]">
            <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
              {"Samsung QN90D"}
            </MarketingText>
          </h3>

          <p className="mt-2 text-sm text-[#87908b]">
            <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
              {"Television \u00B7 Demo Home"}
            </MarketingText>
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5ebdc] text-[#617c43]">
          <Home size={20} />
        </div>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <RecordCell label="Model" value="QN90D" />

        <RecordCell label="Serial" value="0A7X••••92" />

        <RecordCell label="Purchased" value="Mar 14, 2026" />

        <RecordCell label="Location" value="Living Room" />
      </div>
    </motion.div>
  );
}
function FloatingFeature({
  icon: Icon,
  eyebrow,
  title,
  copy,
}: {
  icon: typeof Home;
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -10,
      }}
      transition={{
        duration: 0.35,
        ease,
      }}
      className="rounded-[28px] border border-[#17212a]/8 bg-white/90 p-6 shadow-[0_28px_70px_-52px_rgba(23,33,42,0.4)] backdrop-blur-xl md:p-7"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43]">
          <Icon size={18} />
        </div>

        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
            <MarketingText scope="shared">{eyebrow}</MarketingText>
          </p>

          <h3 className="mt-2 text-base font-semibold text-[#183047]">
            <MarketingText scope="shared">{title}</MarketingText>
          </h3>

          <p className="mt-2 text-sm leading-6 text-[#78827d]">
            <MarketingText scope="shared">{copy}</MarketingText>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
function SmallFeatureCard({
  icon: Icon,
  eyebrow,
  title,
  copy,
}: {
  icon: typeof Home;
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <motion.article
      whileHover={{
        y: -10,
      }}
      transition={{
        duration: 0.4,
        ease,
      }}
      className="rounded-[32px] border border-[#17212a]/8 bg-[#fffdf8] p-7 shadow-[0_30px_70px_-58px_rgba(23,33,42,0.35)] md:p-8"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43]">
        <Icon size={18} />
      </div>

      <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
        <MarketingText scope="shared">{eyebrow}</MarketingText>
      </p>

      <h3 className="mt-3 font-serif text-2xl leading-[1.1] text-[#17212a]">
        <MarketingText scope="shared">{title}</MarketingText>
      </h3>

      <p className="mt-4 text-[15px] leading-7 text-[#747e79]">
        <MarketingText scope="shared">{copy}</MarketingText>
      </p>
    </motion.article>
  );
}
function WarrantyExperience() {
  return (
    <motion.div
      whileHover={{
        y: -10,
      }}
      transition={{
        duration: 0.4,
        ease,
      }}
      className="rounded-[40px] bg-[#183047] p-5 shadow-[0_45px_100px_-58px_rgba(24,48,71,0.75)] md:p-7"
    >
      <div className="rounded-[30px] bg-[#f6f2ea] p-6 md:p-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
          <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
            {"Warranty protection"}
          </MarketingText>
        </p>

        <div className="mt-4 flex items-end justify-between gap-6">
          <div>
            <p className="font-serif text-5xl tracking-[-0.05em] text-[#17212a]">
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {"8"}
              </MarketingText>
            </p>

            <p className="mt-1 text-sm text-[#7e8782]">
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {"active warranties"}
              </MarketingText>
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e6ecde] text-[#617c43]">
            <ShieldCheck size={21} />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <WarrantyRow title="Samsung QN90D" value="24 days remaining" />

          <WarrantyRow title="MacBook Air" value="Active through Jun 2027" />

          <WarrantyRow
            title="LG Refrigerator"
            value="Active through Nov 2028"
          />
        </div>
      </div>
    </motion.div>
  );
}
function WarrantyRow({ title, value }: { title: string; value: string }) {
  return (
    <motion.div
      whileHover={{
        x: 6,
      }}
      className="flex items-center justify-between gap-4 rounded-[17px] bg-white px-4 py-4"
    >
      <p className="text-sm font-semibold text-[#183047]">
        <MarketingText scope="shared">{title}</MarketingText>
      </p>

      <span className="text-xs font-semibold text-[#617c43]">
        <MarketingText scope="shared">{value}</MarketingText>
      </span>
    </motion.div>
  );
}
function DiscoveryExperience() {
  return (
    <motion.div
      whileHover={{
        y: -10,
      }}
      transition={{
        duration: 0.4,
        ease,
      }}
      className="rounded-[42px] bg-[#183047] p-4 shadow-[0_45px_100px_-56px_rgba(24,48,71,0.75)] md:p-6"
    >
      <div className="rounded-[32px] bg-[#fffdf8] p-6 md:p-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.19em] text-[#718d4f]">
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {"Network discovery"}
              </MarketingText>
            </p>

            <h3 className="mt-3 font-serif text-3xl tracking-[-0.04em] text-[#17212a]">
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {"12 devices found."}
              </MarketingText>
            </h3>

            <p className="mt-2 text-sm text-[#848d88]">
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {"Ready for your review"}
              </MarketingText>
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7eddf] text-[#617c43]">
            <Router size={20} />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <DeviceRow
            title="Spectrum WiFi 6E Router"
            detail="Router · Identified"
          />

          <DeviceRow title="Samsung QN90D" detail="Television · Living Room" />

          <DeviceRow title="MacBook Air" detail="Computer · Home Office" />

          <DeviceRow title="Ring Doorbell" detail="Smart Home · Front Door" />
        </div>

        <div className="mt-6 rounded-[20px] bg-[#e8eedf] p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-[#617c43]" />

            <p className="text-xs font-semibold text-[#4f633b]">
              <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
                {"Review. Confirm. Save."}
              </MarketingText>
            </p>
          </div>

          <p className="mt-2 text-xs leading-5 text-[#6d7769]">
            <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
              {
                "You stay in control of what discovered devices enter your Vault."
              }
            </MarketingText>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
function RoleCard({ title, copy }: { title: string; copy: string }) {
  return (
    <motion.article
      whileHover={{
        y: -10,
      }}
      transition={{
        duration: 0.35,
        ease,
      }}
      className="rounded-[30px] border border-[#17212a]/8 bg-[#f6f2ea] p-7"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e5ebdc] text-[#617c43]">
        <Users size={18} />
      </div>

      <h3 className="mt-7 font-serif text-2xl text-[#17212a]">
        <MarketingText scope="shared">{title}</MarketingText>
      </h3>

      <p className="mt-3 text-sm leading-6 text-[#747e79]">
        <MarketingText scope="shared">{copy}</MarketingText>
      </p>
    </motion.article>
  );
}
function MaintenanceTimeline() {
  return (
    <motion.div
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.4,
        ease,
      }}
      className="rounded-[38px] border border-[#17212a]/8 bg-[#fffdf8] p-7 shadow-[0_38px_90px_-62px_rgba(23,33,42,0.45)] md:p-9"
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
        <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
          {"Home history"}
        </MarketingText>
      </p>

      <h3 className="mt-3 font-serif text-3xl text-[#17212a]">
        <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
          {"Refrigerator"}
        </MarketingText>
      </h3>

      <div className="mt-8 space-y-6">
        <TimelineItem
          date="May 18"
          title="Water filter replaced"
          detail="Samsung refrigerator"
        />

        <TimelineItem
          date="Mar 02"
          title="Routine inspection"
          detail="No issues found"
        />

        <TimelineItem
          date="Nov 14"
          title="Service visit"
          detail="Ice maker repaired"
        />
      </div>
    </motion.div>
  );
}
function TimelineItem({
  date,
  title,
  detail,
}: {
  date: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="grid grid-cols-[70px_1fr] gap-4">
      <p className="text-xs font-semibold text-[#617c43]">
        <MarketingText scope="shared">{date}</MarketingText>
      </p>

      <div className="border-l border-[#17212a]/10 pl-5">
        <p className="text-sm font-semibold text-[#183047]">
          <MarketingText scope="shared">{title}</MarketingText>
        </p>

        <p className="mt-1 text-xs text-[#89928d]">
          <MarketingText scope="shared">{detail}</MarketingText>
        </p>
      </div>
    </div>
  );
}
function SearchExperience() {
  return (
    <motion.div
      whileHover={{
        y: -8,
      }}
      className="rounded-[36px] border border-white/10 bg-white/5 p-5 backdrop-blur md:p-7"
    >
      <div className="rounded-[26px] bg-[#fffdf8] p-6 text-[#17212a]">
        <div className="flex items-center gap-3 rounded-[18px] border border-[#17212a]/10 bg-white px-4 py-4">
          <Search size={17} className="text-[#718d4f]" />

          <p className="flex-1 text-sm text-[#7d8782]">
            <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
              {"Which warranties expire soon?"}
            </MarketingText>
          </p>

          <ArrowRight size={15} className="text-[#617c43]" />
        </div>

        <div className="mt-5 rounded-[20px] bg-[#f2eee5] p-5">
          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
            <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
              {"Your Vault found"}
            </MarketingText>
          </p>

          <p className="mt-3 font-serif text-xl text-[#183047]">
            <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
              {"Samsung QN90D"}
            </MarketingText>
          </p>

          <p className="mt-1 text-sm text-[#737d78]">
            <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
              {"Warranty expires in 24 days."}
            </MarketingText>
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#617c43]">
            <ShieldCheck size={14} />
            <MarketingText scope="components/marketing/FeaturesPageContent.tsx">
              {"View warranty"}
            </MarketingText>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
/* ====================================================== */
/* SHARED COMPONENTS */
/* ====================================================== */
function Reveal({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: reduceMotion ? 0 : 34,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.18,
      }}
      transition={{
        duration: reduceMotion ? 0 : 0.75,
        ease,
      }}
    >
      <MarketingText scope="shared">{children}</MarketingText>
    </motion.div>
  );
}
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#183047]/10 bg-white/70 px-4 py-2 text-[#617c43] shadow-[0_10px_40px_-26px_rgba(24,48,71,0.35)] backdrop-blur-xl">
      <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em]">
        <MarketingText scope="shared">{children}</MarketingText>
      </span>
    </div>
  );
}
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.21em] text-[#617c43]">
      <MarketingText scope="shared">{children}</MarketingText>
    </p>
  );
}
function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-[58px] items-center justify-center gap-2 rounded-full bg-[#183047] px-9 text-[15px] font-semibold text-white shadow-[0_26px_60px_-34px_rgba(24,48,71,0.9)] transition duration-300 hover:-translate-y-1 hover:bg-[#223f59]"
    >
      <MarketingText scope="shared">{children}</MarketingText>
    </Link>
  );
}
function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[58px] items-center justify-center rounded-full border border-[#17212a]/10 bg-white/70 px-9 text-[15px] font-semibold text-[#17212a] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white"
    >
      <MarketingText scope="shared">{children}</MarketingText>
    </Link>
  );
}
function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group mt-9 inline-flex items-center gap-2 text-sm font-semibold text-[#183047]"
    >
      <MarketingText scope="shared">{children}</MarketingText>

      <ArrowRight
        size={15}
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
    </Link>
  );
}
function CheckLine({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#718d4f]/10 text-[#617c43]">
        <Check size={12} />
      </div>

      <span className="text-sm leading-6 text-[#68736d]">
        <MarketingText scope="shared">{children}</MarketingText>
      </span>
    </div>
  );
}
function RecordCell({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      className="rounded-[18px] bg-[#ebe7df] px-5 py-4"
    >
      <p className="text-[8px] font-semibold uppercase tracking-[0.17em] text-[#89928d]">
        <MarketingText scope="shared">{label}</MarketingText>
      </p>

      <p className="mt-1 text-sm font-semibold text-[#183047]">
        <MarketingText scope="shared">{value}</MarketingText>
      </p>
    </motion.div>
  );
}
function DarkDocumentRow({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Home;
  title: string;
  detail: string;
}) {
  return (
    <motion.div
      whileHover={{
        x: 5,
      }}
      className="flex items-center gap-4 rounded-[18px] border border-white/10 bg-white/5 px-4 py-4"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">
          <MarketingText scope="shared">{title}</MarketingText>
        </p>

        <p className="mt-1 text-xs text-white/45">
          <MarketingText scope="shared">{detail}</MarketingText>
        </p>
      </div>
    </motion.div>
  );
}
function DeviceRow({ title, detail }: { title: string; detail: string }) {
  return (
    <motion.div
      whileHover={{
        x: 6,
        y: -2,
      }}
      transition={{
        duration: 0.25,
      }}
      className="flex items-center gap-3 rounded-[18px] border border-[#17212a]/8 bg-white px-4 py-3"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf2e7] text-[#617c43]">
        <Router size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#183047]">
          <MarketingText scope="shared">{title}</MarketingText>
        </p>

        <p className="mt-0.5 text-xs text-[#89928d]">
          <MarketingText scope="shared">{detail}</MarketingText>
        </p>
      </div>

      <Check size={15} className="text-[#718d4f]" />
    </motion.div>
  );
}
function FlowDivider() {
  return (
    <div className="relative mx-auto h-16 max-w-[1220px] bg-[#f6f2ea]">
      <div className="absolute left-1/2 top-1/2 h-px w-[90%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#17212a]/10 to-transparent" />

      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#718d4f]/25 bg-[#f6f2ea]" />
    </div>
  );
}
