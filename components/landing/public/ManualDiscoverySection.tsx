"use client";

import Link from "next/link";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Laptop,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Wifi,
} from "lucide-react";
import {
  FormEvent,
  useState,
} from "react";

import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type ManualDiscoverySectionProps = {
  isSignedIn?: boolean;
};

type DiscoveryMode =
  | "search"
  | "scan";

const examples = [
  "LG C4 OLED TV",
  "KitchenAid Artisan stand mixer",
  "Dyson V15 Detect",
];

export default function ManualDiscoverySection({
  isSignedIn = false,
}: ManualDiscoverySectionProps) {
  const [mode, setMode] =
    useState<DiscoveryMode>("search");

  const [deviceName, setDeviceName] =
    useState("");

  const [
    submittedDevice,
    setSubmittedDevice,
  ] = useState<string | null>(null);

  const [
    scanPreviewStarted,
    setScanPreviewStarted,
  ] = useState(false);

  const searchHref = isSignedIn
    ? "/devices/add"
    : MARKETING_ROUTES.signup;

  const scanHref = isSignedIn
    ? "/network/connect"
    : MARKETING_ROUTES.signup;

  function switchMode(
    nextMode: DiscoveryMode
  ) {
    setMode(nextMode);

    if (nextMode === "search") {
      setScanPreviewStarted(false);
    } else {
      setSubmittedDevice(null);
    }
  }

  function showSearchFlow(
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
      id="device-discovery"
      className="border-y border-[#182533]/10 bg-[#f4f0e8] px-5 py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#617c43]/15 bg-[#617c43]/[0.06] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#617c43]">
              <Sparkles
                size={13}
                aria-hidden
              />
              Add devices your way
            </div>

            <h2 className="mt-5 max-w-[560px] font-serif text-4xl font-medium leading-[1.02] tracking-[-0.045em] text-[#17212a] md:text-5xl">
              Search one device.
              <span className="block text-[#617c43]">
                Or scan your whole home.
              </span>
            </h2>

            <p className="mt-5 max-w-[560px] text-base leading-7 text-[#68737b]">
              Home Tech Vault gives you two simple ways to start.
              Search for a device by name when you know what you own,
              or use the Home Connector to discover devices already
              connected to your home network.
            </p>

            <div className="mt-6 space-y-3">
              <FeatureLine>
                Search naturally by device or product name
              </FeatureLine>

              <FeatureLine>
                Scan your private home network for connected devices
              </FeatureLine>

              <FeatureLine>
                Confirm the match before anything is added to your Vault
              </FeatureLine>

              <FeatureLine>
                Attach official manuals automatically when available
              </FeatureLine>
            </div>

            <p className="mt-6 max-w-[520px] text-xs leading-5 text-[#879096]">
              You stay in control. Network discoveries are reviewed
              before they become Vault records.
            </p>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-[#182533]/10 bg-[#fbf9f5] shadow-[0_26px_80px_-52px_rgba(15,25,35,0.55)]">
            <div className="border-b border-[#182533]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#617c43]">
                    Choose how to start
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#17212a]">
                    One Vault. Two easy ways in.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-[#617c43]/[0.07] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#617c43]">
                  Interactive demo
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 rounded-[16px] border border-[#182533]/10 bg-[#f1ede6] p-1">
                <ModeButton
                  active={mode === "search"}
                  icon={Search}
                  label="Search a device"
                  onClick={() =>
                    switchMode("search")
                  }
                />

                <ModeButton
                  active={mode === "scan"}
                  icon={Radar}
                  label="Scan your home"
                  onClick={() =>
                    switchMode("scan")
                  }
                />
              </div>
            </div>

            <div className="p-5 md:p-6">
              <AnimatePresence
                mode="wait"
                initial={false}
              >
                {mode === "search" ? (
                  <motion.div
                    key="search-mode"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.24 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#617c43]/10 text-[#617c43]">
                        <Search
                          size={17}
                          aria-hidden
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#17212a]">
                          Search your device
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#7d878e]">
                          Type the device name the way you normally
                          describe it. HTV helps identify the product,
                          fill in the details, and look for its manual.
                        </p>
                      </div>
                    </div>

                    <form
                      onSubmit={showSearchFlow}
                      className="mt-5"
                    >
                      <label
                        htmlFor="landing-device-search"
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
                            id="landing-device-search"
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
                          key="search-empty"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="mt-6 rounded-[20px] border border-dashed border-[#182533]/12 bg-[#f5f1ea] px-5 py-7 text-center"
                        >
                          <Search
                            size={21}
                            className="mx-auto text-[#617c43]"
                            aria-hidden
                          />

                          <p className="mt-3 text-sm font-semibold text-[#17212a]">
                            Search by the name you already know.
                          </p>

                          <p className="mx-auto mt-2 max-w-[390px] text-xs leading-5 text-[#7d878e]">
                            Actual product matching and manual
                            verification happen inside your Vault.
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key={submittedDevice}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-6"
                        >
                          <ResultHeader
                            eyebrow="Searching for"
                            title={submittedDevice}
                          />

                          <div className="mt-3 space-y-2">
                            <AnimatedStep
                              delay={0.08}
                              icon={Search}
                              title="Find the product"
                              text="Match the name to likely real products."
                            />

                            <AnimatedStep
                              delay={0.18}
                              icon={ShieldCheck}
                              title="Confirm the match"
                              text="Choose the right device before anything is saved."
                            />

                            <AnimatedStep
                              delay={0.28}
                              icon={BookOpen}
                              title="Attach useful details"
                              text="Fill in product details and find the official manual when available."
                              success
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-5">
                      <Link
                        href={searchHref}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[13px] bg-[#17212a] px-4 text-sm font-semibold text-white transition hover:bg-[#22313d]"
                      >
                        {isSignedIn
                          ? "Search My Device"
                          : "Try Search Free"}
                        <ArrowRight
                          size={15}
                          aria-hidden
                        />
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="scan-mode"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.24 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#617c43]/10 text-[#617c43]">
                        <Radar
                          size={18}
                          aria-hidden
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#17212a]">
                          Scan your home network
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#7d878e]">
                          Use the Home Connector to discover devices
                          already connected to your private home network,
                          then review the names before adding them.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[20px] border border-[#182533]/10 bg-[#17212a] p-5 text-white">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-white/10 text-[#a8c47a]">
                            <Wifi
                              size={18}
                              aria-hidden
                            />
                          </div>

                          <div>
                            <p className="text-sm font-semibold">
                              Home Connector
                            </p>

                            <p className="mt-0.5 text-[10px] text-white/50">
                              Private network discovery
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-[#8ca667]/15 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#a8c47a]">
                          You review first
                        </span>
                      </div>

                      {!scanPreviewStarted ? (
                        <button
                          type="button"
                          onClick={() =>
                            setScanPreviewStarted(
                              true
                            )
                          }
                          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[13px] bg-white px-4 text-sm font-semibold text-[#17212a] transition hover:bg-[#f2f2ee]"
                        >
                          <Radar
                            size={16}
                            aria-hidden
                          />
                          Preview a network scan
                        </button>
                      ) : (
                        <div className="mt-5">
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#a8c47a]">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a8c47a] opacity-50" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#a8c47a]" />
                            </span>
                            Scan complete
                          </div>

                          <div className="mt-4 space-y-2">
                            <ScanDevice
                              delay={0.05}
                              name="LG Smart TV"
                              detail="Television · Identified"
                            />

                            <ScanDevice
                              delay={0.15}
                              name="Apple TV"
                              detail="Streaming device · Identified"
                            />

                            <ScanDevice
                              delay={0.25}
                              name="HP Printer"
                              detail="Printer · Needs review"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {scanPreviewStarted ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.35,
                            duration: 0.28,
                          }}
                          className="mt-4 grid gap-2 sm:grid-cols-3"
                        >
                          <MiniBenefit
                            icon={Radar}
                            title="Discover"
                          />

                          <MiniBenefit
                            icon={ShieldCheck}
                            title="Review"
                          />

                          <MiniBenefit
                            icon={Laptop}
                            title="Add to Vault"
                          />
                        </motion.div>
                      ) : null}
                    </AnimatePresence>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Link
                        href={scanHref}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[13px] bg-[#17212a] px-4 text-sm font-semibold text-white transition hover:bg-[#22313d]"
                      >
                        {isSignedIn
                          ? "Connect My Home"
                          : "Start Free"}
                        <ArrowRight
                          size={15}
                          aria-hidden
                        />
                      </Link>

                      <p className="text-[10px] leading-4 text-[#8a9399]">
                        The public preview does not scan your network.
                      </p>
                    </div>
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

function ModeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Search;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 items-center justify-center gap-2 rounded-[12px] px-3 text-xs font-semibold transition ${
        active
          ? "bg-white text-[#17212a] shadow-sm"
          : "text-[#7a848b] hover:text-[#17212a]"
      }`}
    >
      <Icon
        size={15}
        className={
          active
            ? "text-[#617c43]"
            : undefined
        }
        aria-hidden
      />
      {label}
    </button>
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

function ResultHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#617c43]/15 bg-[#617c43]/[0.05] p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#617c43]">
        {eyebrow}
      </p>
      <p className="mt-1 font-serif text-xl font-medium text-[#17212a]">
        {title}
      </p>
    </div>
  );
}

function AnimatedStep({
  delay,
  icon: Icon,
  title,
  text,
  success = false,
}: {
  delay: number;
  icon: typeof Search;
  title: string;
  text: string;
  success?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay,
        duration: 0.3,
      }}
      className={`flex items-start gap-3 rounded-[15px] border p-3.5 ${
        success
          ? "border-[#617c43]/15 bg-[#617c43]/[0.05]"
          : "border-[#182533]/10 bg-white"
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${
          success
            ? "bg-[#617c43] text-white"
            : "bg-[#617c43]/10 text-[#617c43]"
        }`}
      >
        <Icon
          size={14}
          aria-hidden
        />
      </div>

      <div>
        <p className="text-xs font-semibold text-[#17212a]">
          {title}
        </p>

        <p className="mt-1 text-[10px] leading-4 text-[#7b858c]">
          {text}
        </p>
      </div>
    </motion.div>
  );
}

function ScanDevice({
  delay,
  name,
  detail,
}: {
  delay: number;
  name: string;
  detail: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.28,
      }}
      className="flex items-center justify-between gap-4 rounded-[12px] border border-white/10 bg-white/[0.05] px-3.5 py-3"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white/10 text-[#a8c47a]">
          <Wifi
            size={14}
            aria-hidden
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-white">
            {name}
          </p>

          <p className="mt-0.5 text-[9px] text-white/45">
            {detail}
          </p>
        </div>
      </div>

      <CheckCircle2
        size={15}
        className="shrink-0 text-[#a8c47a]"
        aria-hidden
      />
    </motion.div>
  );
}

function MiniBenefit({
  icon: Icon,
  title,
}: {
  icon: typeof Radar;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-[13px] border border-[#182533]/10 bg-white px-3 py-2.5">
      <Icon
        size={14}
        className="text-[#617c43]"
        aria-hidden
      />

      <span className="text-[10px] font-semibold text-[#5f6b73]">
        {title}
      </span>
    </div>
  );
}
