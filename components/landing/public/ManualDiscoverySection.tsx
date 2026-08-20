"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  FormEvent,
  useState,
} from "react";

import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type ManualDiscoverySectionProps = {
  isSignedIn?: boolean;
};

const examples = [
  "KitchenAid Artisan stand mixer",
  "LG C4 OLED TV",
  "Dyson V15 Detect",
];

export default function ManualDiscoverySection({
  isSignedIn = false,
}: ManualDiscoverySectionProps) {
  const [deviceName, setDeviceName] =
    useState("");

  const [
    submittedDevice,
    setSubmittedDevice,
  ] = useState<string | null>(null);

  const primaryHref = isSignedIn
    ? "/devices/add"
    : MARKETING_ROUTES.signup;

  const primaryLabel = isSignedIn
    ? "Try It With My Device"
    : "Try It Free";

  function showFlow(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const value =
      deviceName.trim();

    if (!value) {
      return;
    }

    setSubmittedDevice(value);
  }

  return (
    <section
      id="manual-discovery"
      className="border-y border-[#182533]/10 bg-[#f4f0e8] px-5 py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#617c43]/15 bg-[#617c43]/[0.06] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#617c43]">
              <Sparkles
                size={13}
                aria-hidden
              />
              Automatic device matching
            </div>

            <h2 className="mt-5 max-w-[560px] font-serif text-4xl font-medium leading-[1.02] tracking-[-0.045em] text-[#17212a] md:text-5xl">
              Type the device name.
              <span className="block text-[#617c43]">
                We&apos;ll help find the rest.
              </span>
            </h2>

            <p className="mt-5 max-w-[560px] text-base leading-7 text-[#68737b]">
              Search the way you naturally think about your device —
              like “LG C4 OLED TV” or “KitchenAid Artisan stand mixer.”
              Home Tech Vault can identify the product, fill in key
              details, then check official manufacturer sources for a
              matching manual.
            </p>

            <div className="mt-6 space-y-3">
              <FeatureLine>
                Search by a normal device or product name
              </FeatureLine>

              <FeatureLine>
                Product details are filled in after you choose the match
              </FeatureLine>

              <FeatureLine>
                A matching official manual can be attached automatically
              </FeatureLine>
            </div>

            <div className="mt-7">
              <Link
                href={primaryHref}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[13px] bg-[#17212a] px-4 text-sm font-semibold text-white transition hover:bg-[#22313d]"
              >
                {primaryLabel}
                <ArrowRight
                  size={15}
                  aria-hidden
                />
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[#182533]/10 bg-[#fbf9f5] shadow-[0_24px_70px_-50px_rgba(15,25,35,0.5)]">
            <div className="border-b border-[#182533]/10 px-5 py-4 md:px-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#617c43]">
                    See the flow
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#17212a]">
                    Search by device name
                  </p>
                </div>

                <span className="rounded-full bg-[#617c43]/[0.07] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#617c43]">
                  Demo
                </span>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <form
                onSubmit={showFlow}
              >
                <label
                  htmlFor="manual-demo-device-name"
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-[#7f888e]"
                >
                  Device name
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8a949b]"
                      aria-hidden
                    />

                    <input
                      id="manual-demo-device-name"
                      value={deviceName}
                      onChange={(event) => {
                        setDeviceName(
                          event.target.value
                        );

                        if (
                          submittedDevice
                        ) {
                          setSubmittedDevice(
                            null
                          );
                        }
                      }}
                      placeholder="e.g. LG C4 OLED TV"
                      autoComplete="off"
                      className="h-12 w-full rounded-[14px] border border-[#182533]/10 bg-white pl-11 pr-4 text-sm font-medium text-[#17212a] outline-none transition placeholder:text-[#9aa2a8] focus:border-[#617c43]/40 focus:ring-2 focus:ring-[#617c43]/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      !deviceName.trim()
                    }
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#617c43] px-5 text-sm font-semibold text-white transition hover:bg-[#6d884a] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    See the flow
                    <ArrowRight
                      size={15}
                      aria-hidden
                    />
                  </button>
                </div>
              </form>

              <div className="mt-3 flex flex-wrap gap-2">
                {examples.map(
                  (example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setDeviceName(
                          example
                        );
                        setSubmittedDevice(
                          example
                        );
                      }}
                      className="rounded-full border border-[#182533]/10 bg-white px-3 py-1.5 text-[10px] font-semibold text-[#68737b] transition hover:border-[#617c43]/25 hover:text-[#617c43]"
                    >
                      {example}
                    </button>
                  )
                )}
              </div>

              <AnimatePresence
                mode="wait"
                initial={false}
              >
                {!submittedDevice ? (
                  <motion.div
                    key="manual-empty"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                    className="mt-6 rounded-[20px] border border-dashed border-[#182533]/12 bg-[#f5f1ea] px-5 py-8 text-center"
                  >
                    <Search
                      size={22}
                      className="mx-auto text-[#617c43]"
                      aria-hidden
                    />

                    <p className="mt-3 text-sm font-semibold text-[#17212a]">
                      Type a device name to preview the workflow.
                    </p>

                    <p className="mx-auto mt-2 max-w-[390px] text-xs leading-5 text-[#7d878e]">
                      The public demo shows the experience. Actual product
                      matching and official manual verification happen
                      inside your Vault.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={submittedDevice}
                    initial={{
                      opacity: 0,
                      y: 14,
                      scale: 0.985,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    transition={{
                      duration: 0.32,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="mt-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.04,
                        duration: 0.28,
                      }}
                      className="rounded-[18px] border border-[#617c43]/15 bg-[#617c43]/[0.05] p-4"
                    >
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#617c43]">
                        Searching for
                      </p>

                      <p className="mt-1 font-serif text-xl font-medium text-[#17212a]">
                        {submittedDevice}
                      </p>
                    </motion.div>

                    <div className="mt-4 space-y-2.5">
                      <AnimatedFlowRow
                        delay={0.12}
                        icon={Search}
                        number="1"
                        title="Find the product"
                        text="Search for likely matches using the device name you entered."
                      />

                      <AnimatedFlowRow
                        delay={0.24}
                        icon={ShieldCheck}
                        number="2"
                        title="Confirm the exact device"
                        text="Choose the correct match so brand, model, and product details can be filled in."
                      />

                      <AnimatedFlowRow
                        delay={0.36}
                        icon={BookOpen}
                        number="3"
                        title="Find the official manual"
                        text="Check official manufacturer sources and attach the matching manual when available."
                        success
                      />
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.5,
                        duration: 0.3,
                      }}
                      className="mt-4 grid gap-2 sm:grid-cols-3"
                    >
                      <MiniRecord
                        icon={FileText}
                        label="Device details"
                      />

                      <MiniRecord
                        icon={ShieldCheck}
                        label="Warranty"
                      />

                      <MiniRecord
                        icon={BookOpen}
                        label="Manual"
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureLine({
  children,
}: {
  children: string;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm font-medium text-[#556169]">
      <CheckCircle2
        size={16}
        className="shrink-0 text-[#617c43]"
        aria-hidden
      />
      {children}
    </div>
  );
}

function AnimatedFlowRow({
  delay,
  ...props
}: {
  delay: number;
  icon: typeof Search;
  number: string;
  title: string;
  text: string;
  success?: boolean;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 16,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        delay,
        duration: 0.32,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <FlowRow
        {...props}
      />
    </motion.div>
  );
}

function FlowRow({
  icon: Icon,
  number,
  title,
  text,
  success = false,
}: {
  icon: typeof Search;
  number: string;
  title: string;
  text: string;
  success?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-[16px] border p-4 ${
        success
          ? "border-[#617c43]/15 bg-[#617c43]/[0.05]"
          : "border-[#182533]/10 bg-white"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          success
            ? "bg-[#617c43] text-white"
            : "bg-[#617c43]/10 text-[#617c43]"
        }`}
      >
        <Icon
          size={15}
          aria-hidden
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#8a949b]">
          Step {number}
        </p>

        <p className="mt-1 text-sm font-semibold text-[#17212a]">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-[#7b858c]">
          {text}
        </p>
      </div>
    </div>
  );
}

function MiniRecord({
  icon: Icon,
  label,
}: {
  icon: typeof FileText;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-[14px] border border-[#182533]/10 bg-white px-3 py-2.5">
      <Icon
        size={14}
        className="text-[#617c43]"
        aria-hidden
      />

      <span className="text-[10px] font-semibold text-[#5f6b73]">
        {label}
      </span>
    </div>
  );
}
