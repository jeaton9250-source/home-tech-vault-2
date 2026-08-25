"use client";

import {
  ArrowRight,
  BarChart3,
  FileText,
  House,
  Laptop,
  Radar,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";

import MarketingLayout, {
  MarketingContent,
} from "@/components/marketing/MarketingLayout";
import { useDemoMode } from "@/hooks/useDemoMode";
import { MORGAN_HOUSEHOLD } from "@/lib/demo/morganHousehold";

const demoFeatures = [
  {
    icon: Laptop,
    number: "01",
    title: "Device Inventory",
    description:
      "Browse computers, TVs, gaming consoles, appliances, and smart-home devices.",
  },
  {
    icon: House,
    number: "02",
    title: "Home View",
    description:
      "See technology organized by rooms throughout the sample household.",
  },
  {
    icon: ShieldCheck,
    number: "03",
    title: "Warranty Center",
    description:
      "Review active, expiring, expired, and missing warranties.",
  },
  {
    icon: Wrench,
    number: "04",
    title: "Maintenance",
    description:
      "Explore scheduled maintenance and device service history.",
  },
  {
    icon: Radar,
    number: "05",
    title: "Network Center",
    description:
      "Preview router, Wi-Fi, and connected-device information.",
  },
  {
    icon: FileText,
    number: "06",
    title: "Documents",
    description:
      "View receipts, manuals, warranty records, and household files.",
  },
  {
    icon: BarChart3,
    number: "07",
    title: "Reports",
    description:
      "Preview insurance, warranty, and home technology summaries.",
  },
  {
    icon: Sparkles,
    number: "08",
    title: "Smart Import™",
    description:
      "See how purchase information can move into the Vault with less manual entry.",
  },
];

export default function DemoPage() {
  const router = useRouter();
  const { startDemo } = useDemoMode();

  function enterDemo() {
    startDemo();
    router.push("/dashboard");
  }

  return (
    <MarketingLayout minimalNav>
      <MarketingContent className="py-0">
        {/* HERO */}

        <section className="relative overflow-hidden px-0 pb-24 pt-20 md:pb-32 md:pt-28">
          <div className="pointer-events-none absolute right-[-250px] top-0 h-[650px] w-[650px] rounded-full bg-[#718d4f]/10 blur-[130px]" />

          <div className="relative grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-7 bg-[#718d4f]" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#718d4f]">
                  Interactive Demo
                </p>
              </div>

              <h1 className="mt-6 max-w-2xl font-serif text-4xl font-medium leading-[1.02] tracking-[-0.05em] text-[#17212a] sm:text-5xl lg:text-6xl">
                See what an organized
                <br />
                home technology
                <br />

                <span className="text-[#718d4f]">
                  system feels like.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-[#59625d]">
                Explore a fully populated sample Home Tech Vault and see how
                devices, warranties, documents, maintenance, network records,
                and household information work together.
              </p>

              <button
                type="button"
                onClick={enterDemo}
                className="mt-9 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-[#718d4f]/45 bg-[#617c43] px-7 text-sm font-semibold text-white shadow-[0_20px_40px_-20px_rgba(97,124,67,0.8)] transition hover:bg-[#718d4f] sm:w-auto"
              >
                Enter the Demo

                <ArrowRight size={16} />
              </button>

              <p className="mt-4 text-xs font-medium text-[#7c847f]">
                No account required.
              </p>
            </div>

            {/* DEMO PREVIEW */}

            <div className="relative">
              <div className="absolute -inset-8 -z-10 rounded-full bg-[#718d4f]/6 blur-3xl" />

              <div className="overflow-hidden rounded-[30px] border border-white/15 bg-[#183047] shadow-[0_40px_100px_-35px_rgba(0,0,0,0.85)]">
                <div className="flex items-center justify-between border-b border-white/10 bg-[#132536] px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#718d4f]/25 bg-[#718d4f]/10 text-[#718d4f]">
                      <ShieldCheck size={18} />
                    </div>

                    <div>
                      <p className="font-serif text-sm text-[#f5f1e8]">
                        Home Tech Vault
                      </p>

                      <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#8e9690]">
                        {MORGAN_HOUSEHOLD.name}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-[#718d4f]/25 bg-[#718d4f]/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#718d4f]">
                    Demo Mode
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
                  <DemoMetric value="24" label="Devices" />
                  <DemoMetric value="47" label="Documents" />
                  <DemoMetric value="18" label="Warranties" />
                  <DemoMetric value="8" label="Subscriptions" />
                </div>

                <div className="p-6">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8e9690]">
                    What you can explore
                  </p>

                  <div className="mt-4 space-y-3">
                    <PreviewRow
                      icon={Laptop}
                      title="Home inventory"
                      text="Room, purchase and warranty details"
                    />

                    <PreviewRow
                      icon={Radar}
                      title="Home Wi-Fi"
                      text="Internet, router, and connected device details"
                    />

                    <PreviewRow
                      icon={FileText}
                      title="Documents"
                      text="Receipts, manuals, and important home files"
                    />

                    <PreviewRow
                      icon={Wrench}
                      title="Maintenance"
                      text="Upcoming maintenance and past service"
                    />
                  </div>

                  <div className="mt-5 rounded-2xl border border-[#718d4f]/20 bg-[#718d4f]/8 p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles
                        size={15}
                        className="text-[#718d4f]"
                      />

                      <p className="text-xs font-semibold text-[#e5eaed]">
                        Everything is ready to explore.
                      </p>
                    </div>

                    <p className="mt-2 text-[10px] leading-5 text-white/35">
                      Look around without adding any of your own information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE INTRO */}

        <section className="border-t border-white/10 py-20 md:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-7 bg-[#718d4f]" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#718d4f]">
                  Explore the Vault
                </p>
              </div>

              <h2 className="mt-5 max-w-lg font-serif text-4xl font-medium leading-[1.03] tracking-[-0.045em] text-[#17212a] sm:text-5xl">
                See the whole product before creating your own Vault.
              </h2>
            </div>

            <p className="max-w-xl text-base leading-8 text-[#59625d]">
              The demo gives you a realistic sample household so you can
              understand how Home Tech Vault fits together before signing up.
            </p>
          </div>

          <div className="mt-14 grid border-l border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {demoFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group relative min-h-[240px] border-b border-r border-white/10 p-6 transition hover:bg-white/[0.025]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#718d4f]/25 bg-[#718d4f]/10 text-[#718d4f]">
                      <Icon
                        size={17}
                        strokeWidth={1.8}
                      />
                    </div>

                    <span className="font-serif text-sm font-semibold text-[#17212a]">
                      {feature.number}
                    </span>
                  </div>

                  <h3 className="mt-7 font-serif text-xl text-[#17212a]">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#68716c]">
                    {feature.description}
                  </p>

                  <div className="absolute bottom-0 left-0 h-px w-0 bg-[#718d4f] transition-all duration-300 group-hover:w-full" />
                </article>
              );
            })}
          </div>
        </section>

        {/* FINAL CTA */}

        <section className="border-t border-white/10 py-24 text-center md:py-32">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#718d4f]/25 bg-[#718d4f]/10 text-[#718d4f]">
            <House size={20} />
          </div>

          <h2 className="mx-auto mt-6 max-w-3xl font-serif text-4xl font-medium leading-[1.03] tracking-[-0.045em] text-[#17212a] sm:text-5xl">
            Ready to step inside the Vault?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[#59625d]">
            Explore the sample household and see how the complete Home Tech
            Vault experience works.
          </p>

          <button
            type="button"
            onClick={enterDemo}
            className="mt-8 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[#617c43] px-8 text-sm font-semibold text-white transition hover:bg-[#718d4f]"
          >
            Start Interactive Demo

            <ArrowRight size={16} />
          </button>
        </section>
      </MarketingContent>
    </MarketingLayout>
  );
}

function DemoMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="bg-[#0d1926] px-4 py-5 text-center">
      <p className="font-serif text-2xl text-[#f5f1e8]">
        {value}
      </p>

      <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-[#8e9690]">
        {label}
      </p>
    </div>
  );
}

function PreviewRow({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Laptop;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0d1926] p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#718d4f]/10 text-[#718d4f]">
        <Icon size={15} />
      </div>

      <div>
        <p className="text-xs font-semibold text-[#e5eaed]">
          {title}
        </p>

        <p className="mt-1 text-[10px] text-[#8e9690]">
          {text}
        </p>
      </div>
    </div>
  );
}