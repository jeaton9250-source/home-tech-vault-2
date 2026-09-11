"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  FolderOpen,
  Home,
  Receipt,
  Router,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

import { MARKETING_ROUTES } from "@/lib/marketing/routes";

const recordItems = [
  {
    icon: Receipt,
    label: "Receipt",
    title: "Proof of purchase",
    copy: "Keep the receipt beside the thing you actually bought.",
  },
  {
    icon: ShieldCheck,
    label: "Warranty",
    title: "Know what is still covered",
    copy: "Coverage dates stay connected to the device instead of buried in email.",
  },
  {
    icon: FileText,
    label: "Manual",
    title: "The instructions are already there",
    copy: "Stop searching the web for the same manual every time something acts up.",
  },
  {
    icon: Wrench,
    label: "Maintenance",
    title: "Remember what happened before",
    copy: "Service notes and maintenance history build a useful record over time.",
  },
];

export default function PremiumLandingSections() {
  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* PROOF STRIP */}
      {/* ---------------------------------------------------- */}

      <section className="border-y border-[#17212a]/8 bg-[#fffdf8] px-5 py-6 md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1180px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ProofItem text="Free to start" />
          <ProofItem text="Connector included on Free" />
          <ProofItem text="Up to 8 devices on Free" />
          <ProofItem text="No credit card required" />
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* PROBLEM / WHY IT EXISTS */}
      {/* ---------------------------------------------------- */}

      <section className="bg-[#fffdf8] px-5 py-24 md:px-8 md:py-32 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#617c43]">
                The problem is not owning the stuff
              </p>

              <h2 className="mt-5 max-w-[560px] font-serif text-4xl font-medium leading-[1.02] tracking-[-0.045em] text-[#17212a] sm:text-5xl lg:text-6xl">
                It&apos;s remembering everything that
                came with it.
              </h2>
            </div>

            <div className="max-w-[640px] lg:justify-self-end">
              <p className="text-xl leading-9 text-[#65706a]">
                The receipt is in your inbox. The warranty
                is somewhere else. The manual disappeared.
                The model number is behind the appliance.
                The service history lives in your head.
              </p>

              <p className="mt-5 text-lg leading-8 text-[#87908b]">
                Home Tech Vault gives the useful information
                about your home one dependable place to live.
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            <PainCard
              icon={Search}
              eyebrow="When something breaks"
              title="You should not have to start from zero."
              copy="The model, receipt, warranty and manual should already be waiting for you."
            />

            <PainCard
              icon={Wrench}
              eyebrow="When something needs service"
              title="The history should stay with the thing."
              copy="Keep the dates, notes and records that become important later."
            />

            <PainCard
              icon={Home}
              eyebrow="When your home changes"
              title="Your home should have a memory."
              copy="Build a useful record that grows naturally as you live there."
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* BENTO / WHAT THE VAULT HOLDS */}
      {/* ---------------------------------------------------- */}

      <section className="bg-[#f5f1e8] px-5 py-24 md:px-8 md:py-32 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto max-w-[760px] text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#617c43]">
              One record. Everything that matters.
            </p>

            <h2 className="mt-5 font-serif text-4xl font-medium leading-[1.03] tracking-[-0.045em] text-[#17212a] sm:text-5xl">
              Keep the story behind the stuff.
            </h2>

            <p className="mx-auto mt-6 max-w-[650px] text-lg leading-8 text-[#6c7671]">
              Home Tech Vault is not just an inventory.
              It keeps the information you&apos;ll actually
              need later connected to the right thing.
            </p>
          </div>

          <div className="mt-16 grid gap-5 lg:grid-cols-12">
            {/* Featured device record */}
            <div className="overflow-hidden rounded-[32px] bg-[#183047] p-7 text-white shadow-[0_28px_70px_-42px_rgba(24,48,71,0.85)] lg:col-span-7 md:p-9">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#b7cd9d]">
                    Living Room
                  </p>

                  <h3 className="mt-3 font-serif text-3xl">
                    Samsung QN90D
                  </h3>

                  <p className="mt-2 text-sm text-white/50">
                    Television · Added to Demo Home
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Home size={20} />
                </div>
              </div>

              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                <DarkRecordItem
                  label="Warranty"
                  value="Active"
                />
                <DarkRecordItem
                  label="Receipt"
                  value="Saved"
                />
                <DarkRecordItem
                  label="Manual"
                  value="Ready"
                />
                <DarkRecordItem
                  label="Model"
                  value="QN90D"
                />
              </div>

              <div className="mt-7 rounded-[20px] border border-white/10 bg-white/5 p-5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#b7cd9d]">
                  Good to know
                </p>

                <p className="mt-2 font-serif text-xl leading-7">
                  Everything tied to this device stays
                  together.
                </p>
              </div>
            </div>

            {/* Documents */}
            <div className="rounded-[32px] border border-[#17212a]/8 bg-[#fffdf8] p-7 lg:col-span-5 md:p-9">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43]">
                <FolderOpen size={21} />
              </div>

              <p className="mt-8 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
                Your records
              </p>

              <h3 className="mt-3 font-serif text-3xl tracking-[-0.03em] text-[#17212a]">
                The paperwork belongs with the product.
              </h3>

              <p className="mt-4 text-[15px] leading-7 text-[#717b76]">
                Receipts, warranty documents, manuals and
                service records stay connected instead of
                becoming another folder you have to search.
              </p>

              <div className="mt-7 space-y-2">
                <MiniFileRow label="Purchase receipt" />
                <MiniFileRow label="Product manual" />
                <MiniFileRow label="Warranty information" />
              </div>
            </div>

            {recordItems.map((item) => (
              <div
                key={item.label}
                className="rounded-[28px] border border-[#17212a]/8 bg-[#fffdf8] p-6 lg:col-span-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf2e7] text-[#617c43]">
                  <item.icon size={18} />
                </div>

                <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.17em] text-[#718d4f]">
                  {item.label}
                </p>

                <h3 className="mt-2 font-serif text-xl leading-7 text-[#17212a]">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#77817c]">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* CONNECTED HOME */}
      {/* ---------------------------------------------------- */}

      <section className="bg-[#183047] px-5 py-24 text-white md:px-8 md:py-32 lg:px-12">
        <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Router size={14} className="text-[#b5cb99]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#b5cb99]">
                Home Wi-Fi
              </span>
            </div>

            <h2 className="mt-7 max-w-[560px] font-serif text-4xl font-medium leading-[1.03] tracking-[-0.04em] sm:text-5xl">
              Your home network can help build the Vault.
            </h2>

            <p className="mt-6 max-w-[600px] text-lg leading-8 text-white/60">
              The Home Tech Vault Connector can help discover
              devices already on your network, making it
              easier to see what belongs in your Vault.
            </p>

            <div className="mt-8 space-y-3">
              <FeatureCheck text="Manual device discovery included on Free" />
              <FeatureCheck text="One Connector included on Free" />
              <FeatureCheck text="Choose what you want to save to your Vault" />
              <FeatureCheck text="Automatic monitoring available with upgraded plans" />
            </div>

            <Link
              href="/network"
              className="mt-9 inline-flex min-h-[52px] items-center gap-2 rounded-full bg-[#718d4f] px-7 text-sm font-semibold text-white transition hover:bg-[#809b5c]"
            >
              Explore Home Wi-Fi
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="rounded-[34px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm md:p-7">
            <div className="rounded-[26px] bg-[#fffdf8] p-6 text-[#17212a]">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#718d4f]">
                    Network discovery
                  </p>

                  <h3 className="mt-2 font-serif text-2xl">
                    12 devices found
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf2e7] text-[#617c43]">
                  <Router size={19} />
                </div>
              </div>

              <div className="mt-7 space-y-2">
                <NetworkDevice
                  title="Spectrum WiFi 6E Router"
                  detail="Router · Identified"
                />
                <NetworkDevice
                  title="Samsung QN90D"
                  detail="Television · Living Room"
                />
                <NetworkDevice
                  title="MacBook Air"
                  detail="Computer · Home Office"
                />
                <NetworkDevice
                  title="Ring Doorbell"
                  detail="Smart Home · Front Door"
                />
              </div>

              <div className="mt-6 rounded-[18px] bg-[#edf2e7] p-4">
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={15}
                    className="text-[#617c43]"
                  />

                  <p className="text-xs font-semibold text-[#50643b]">
                    Discovery makes setup easier.
                  </p>
                </div>

                <p className="mt-2 text-xs leading-5 text-[#6f796c]">
                  Review what was found, confirm the details,
                  then save the devices you want in your Vault.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SIMPLE PRODUCT PHILOSOPHY */}
      {/* ---------------------------------------------------- */}

      <section className="bg-[#fffdf8] px-5 py-24 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-[950px] text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#617c43]">
            You do not need to organize everything today
          </p>

          <h2 className="mx-auto mt-5 max-w-[760px] font-serif text-4xl font-medium leading-[1.04] tracking-[-0.045em] text-[#17212a] sm:text-5xl">
            Start with one thing you&apos;d hate to lose.
          </h2>

          <p className="mx-auto mt-6 max-w-[660px] text-lg leading-8 text-[#737d78]">
            Your refrigerator receipt. Your HVAC warranty.
            The manual for the washer. Add one useful thing,
            then let your home record grow naturally.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={MARKETING_ROUTES.signup}
              className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-[#183047] px-8 text-sm font-semibold text-white transition hover:bg-[#234059]"
            >
              Start My Home Vault
              <ArrowRight size={15} />
            </Link>

            <Link
              href={MARKETING_ROUTES.demo}
              className="inline-flex min-h-[54px] items-center justify-center rounded-full border border-[#17212a]/12 bg-white px-8 text-sm font-semibold text-[#17212a] transition hover:bg-[#f7f4ed]"
            >
              Explore the Demo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function ProofItem({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 text-center text-sm font-medium text-[#64706a]">
      <Check
        size={15}
        className="shrink-0 text-[#718d4f]"
      />
      {text}
    </div>
  );
}

function PainCard({
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
    <article className="rounded-[28px] border border-[#17212a]/8 bg-[#f8f5ef] p-7">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf2e7] text-[#617c43]">
        <Icon size={19} />
      </div>

      <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.17em] text-[#7f8983]">
        {eyebrow}
      </p>

      <h3 className="mt-3 font-serif text-2xl leading-8 text-[#17212a]">
        {title}
      </h3>

      <p className="mt-4 text-[15px] leading-7 text-[#6d7772]">
        {copy}
      </p>
    </article>
  );
}

function DarkRecordItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[8px] uppercase tracking-[0.15em] text-white/35">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-white/85">
        {value}
      </p>
    </div>
  );
}

function MiniFileRow({
  label,
}: {
  label: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[16px] bg-[#f5f1e8] px-4 py-3">
      <div className="flex items-center gap-3">
        <FileText
          size={15}
          className="text-[#718d4f]"
        />
        <span className="text-sm text-[#59635e]">
          {label}
        </span>
      </div>

      <span className="text-[10px] font-semibold text-[#617c43]">
        Saved
      </span>
    </div>
  );
}

function FeatureCheck({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#718d4f]/20 text-[#b9ce9f]">
        <Check size={12} />
      </div>

      <span className="text-sm leading-6 text-white/70">
        {text}
      </span>
    </div>
  );
}

function NetworkDevice({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-[#17212a]/8 bg-white px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf2e7] text-[#617c43]">
        <Router size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#183047]">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-[#87908b]">
          {detail}
        </p>
      </div>

      <Check
        size={15}
        className="text-[#718d4f]"
      />
    </div>
  );
}
