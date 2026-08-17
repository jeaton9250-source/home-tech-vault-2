"use client";

import {
  Check,
  CheckCircle2,
  Forward,
  Mail,
  Sparkles,
} from "lucide-react";

import { motion } from "framer-motion";

const importedFields = [
  {
    label: "Device",
    value: 'LG 34" UltraWide Monitor',
  },
  {
    label: "Category",
    value: "Monitor",
  },
  {
    label: "Retailer",
    value: "Best Buy",
  },
  {
    label: "Purchased",
    value: "Aug 12, 2026",
  },
  {
    label: "Price",
    value: "$349.99",
  },
];

export default function SmartImportDemoSection() {
  return (
    <section
      id="smart-import-demo"
      className="relative overflow-hidden bg-[#eee9df] px-5 py-24 text-[#101a22] md:px-8 md:py-32 lg:px-12"
    >
      {/* BACKGROUND DETAIL */}

      <div className="pointer-events-none absolute -right-52 top-10 h-[620px] w-[620px] rounded-full bg-[#718d4f]/10 blur-[130px]" />

      <div className="relative mx-auto max-w-[1240px]">
        {/* INTRO */}

        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-7 bg-[#617c43]" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#617c43]">
                Smart Import™
              </p>
            </div>

            <h2 className="mt-5 max-w-xl font-serif text-4xl font-medium leading-[1.03] tracking-[-0.045em] text-[#101a22] sm:text-5xl lg:text-[3.5rem]">
              Forward it.
              <br />

              <span className="text-[#617c43]">
                We&apos;ll do the typing.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-xl text-base leading-8 text-[#5f6a72]">
              You already receive order confirmations when you buy
              something. Forward the email to your private Smart Import
              address and Home Tech Vault prepares the important details
              for you to review.
            </p>
          </div>
        </div>

        {/* 3 STEP OVERVIEW */}

        <div className="mt-14 grid border-l border-t border-[#182533]/10 md:grid-cols-3">
          <StepCard
            number="01"
            icon={Forward}
            title="Forward"
            description="Send the receipt or order confirmation you already received."
          />

          <StepCard
            number="02"
            icon={Sparkles}
            title="We organize"
            description="Smart Import identifies useful product and purchase information."
          />

          <StepCard
            number="03"
            icon={CheckCircle2}
            title="You approve"
            description="Nothing is added to your Vault until you review it."
          />
        </div>

        {/* MAIN DEMO */}

        <div className="mt-20 grid gap-10 lg:grid-cols-[0.85fr_auto_1.15fr] lg:items-center">
          {/* EMAIL */}

          <motion.div
            initial={{
              opacity: 0,
              y: 24,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="overflow-hidden rounded-[26px] border border-[#182533]/10 bg-[#f8f5ef] shadow-[0_30px_70px_-45px_rgba(15,25,35,0.45)]"
          >
            {/* EMAIL HEADER */}

            <div className="border-b border-[#182533]/10 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#172432] text-[#dce3e7]">
                    <Mail
                      size={17}
                      strokeWidth={1.7}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#849097]">
                      Order confirmation
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#17212a]">
                      Best Buy
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-[#182533]/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7a858d]">
                  Demo
                </span>
              </div>
            </div>

            {/* EMAIL BODY */}

            <div className="p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#849097]">
                Your order is confirmed
              </p>

              <h3 className="mt-3 font-serif text-2xl leading-tight text-[#101a22]">
                LG 34&quot; UltraWide
                <br />
                Monitor
              </h3>

              <div className="mt-6 border-y border-[#182533]/10 py-4">
                <div className="flex justify-between gap-4">
                  <span className="text-xs text-[#78838a]">
                    Ordered
                  </span>

                  <span className="text-xs font-semibold text-[#253039]">
                    Aug 12, 2026
                  </span>
                </div>

                <div className="mt-3 flex justify-between gap-4">
                  <span className="text-xs text-[#78838a]">
                    Order total
                  </span>

                  <span className="font-serif text-lg text-[#253039]">
                    $349.99
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#849097]">
                  Instead of entering this manually...
                </p>
              </div>
            </div>
          </motion.div>

          {/* DESKTOP CONNECTOR */}

          <div className="relative hidden h-full w-28 items-center justify-center lg:flex">
            <div className="absolute left-0 right-0 h-px bg-[#182533]/15" />

            <motion.div
              initial={{
                x: -32,
                opacity: 0,
              }}
              whileInView={{
                x: 32,
                opacity: [0, 1, 1, 0],
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 1.35,
                delay: 0.45,
                ease: "easeInOut",
              }}
              className="absolute z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#617c43] text-white shadow-lg"
            >
              <Forward size={15} />
            </motion.div>
          </div>

          {/* MOBILE CONNECTOR */}

          <div className="relative mx-auto flex h-20 w-px items-center justify-center bg-[#182533]/15 lg:hidden">
            <motion.div
              initial={{
                y: -20,
                opacity: 0,
              }}
              whileInView={{
                y: 20,
                opacity: [0, 1, 1, 0],
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 1.2,
                delay: 0.4,
              }}
              className="absolute flex h-9 w-9 items-center justify-center rounded-full bg-[#617c43] text-white"
            >
              <Forward
                size={15}
                className="rotate-90"
              />
            </motion.div>
          </div>

          {/* SMART IMPORT RESULT */}

          <motion.div
            initial={{
              opacity: 0,
              y: 28,
              scale: 0.985,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            transition={{
              duration: 0.6,
              delay: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="overflow-hidden rounded-[28px] border border-white/15 bg-[#0f1d2b] text-[#f4f0e8] shadow-[0_35px_90px_-40px_rgba(0,0,0,0.8)]"
          >
            {/* RESULT TOP */}

            <div className="border-b border-white/10 bg-[#132536] px-6 py-5 sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      rotate: [0, 8, -6, 0],
                      scale: [1, 1.15, 1],
                    }}
                    transition={{
                      duration: 1.3,
                      delay: 1.3,
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#718d4f]/30 bg-[#718d4f]/10 text-[#8ca667]"
                  >
                    <Sparkles
                      size={17}
                      strokeWidth={1.8}
                    />
                  </motion.div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8ca667]">
                      Smart Import™
                    </p>

                    <p className="mt-1 text-xs text-white/45">
                      Ready for review
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-[#718d4f]/25 bg-[#718d4f]/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#8ca667]">
                  Found
                </span>
              </div>

              <motion.h3
                initial={{
                  opacity: 0,
                  x: -8,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: 1.15,
                  duration: 0.4,
                }}
                className="mt-6 font-serif text-2xl leading-tight text-[#f4f0e8] sm:text-3xl"
              >
                LG 34&quot; UltraWide Monitor
              </motion.h3>

              <p className="mt-2 text-xs leading-5 text-white/45">
                Review the details before adding this device to your Vault.
              </p>
            </div>

            {/* FIELDS */}

            <div className="space-y-px bg-white/10">
              {importedFields.map(
                (field, index) => (
                  <motion.div
                    key={field.label}
                    initial={{
                      opacity: 0,
                      x: 16,
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.35,
                      delay:
                        1.25 +
                        index * 0.12,
                    }}
                    className="grid grid-cols-[0.7fr_1.3fr] bg-[#101d2b] px-6 py-4 sm:px-8"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.11em] text-white/30">
                      {field.label}
                    </span>

                    <span className="text-right text-sm font-medium text-[#e4e9ec]">
                      {field.value}
                    </span>
                  </motion.div>
                )
              )}
            </div>

            {/* APPROVAL */}

            <div className="border-t border-white/10 p-6 sm:p-8">
              <motion.button
                type="button"
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.4,
                  delay: 2,
                }}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#8ba866]/40 bg-[#617c43] px-5 text-sm font-semibold text-white shadow-[0_16px_35px_-20px_rgba(97,124,67,0.9)] transition hover:bg-[#718d4f]"
              >
                <Check
                  size={16}
                  strokeWidth={2}
                />

                Add to My Vault
              </motion.button>

              <motion.div
                initial={{
                  opacity: 0,
                }}
                whileInView={{
                  opacity: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: 2.15,
                }}
                className="mt-4 flex items-center justify-center gap-2"
              >
                <CheckCircle2
                  size={13}
                  className="text-[#8ca667]"
                />

                <p className="text-[10px] text-white/35">
                  Nothing is saved until you approve it.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* PRIVATE ADDRESS */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.5,
            delay: 1,
          }}
          className="mx-auto mt-12 max-w-2xl rounded-[22px] border border-[#182533]/10 bg-[#e4ded3] px-6 py-5 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <Mail
              size={14}
              className="text-[#617c43]"
            />

            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
              Your private Smart Import address
            </p>
          </div>

          <p className="mt-2 break-all font-serif text-lg text-[#17212a] sm:text-xl">
            demo.user@fuevwun.resend.app
          </p>

          <p className="mt-2 text-xs text-[#747e85]">
            Every account gets its own Smart Import address.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function StepCard({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: typeof Forward;
  title: string;
  description: string;
}) {
  return (
    <article className="group relative min-h-[210px] border-b border-r border-[#182533]/10 p-6 transition-colors hover:bg-[#f7f3ec] sm:p-7">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#718d4f]/10 text-[#617c43]">
          <Icon
            size={17}
            strokeWidth={1.8}
          />
        </div>

        <span className="font-serif text-sm text-[#9aa1a5]">
          {number}
        </span>
      </div>

      <h3 className="mt-7 font-serif text-xl text-[#17212a]">
        {title}
      </h3>

      <p className="mt-2 max-w-xs text-sm leading-6 text-[#68737a]">
        {description}
      </p>

      <div className="absolute bottom-0 left-0 h-px w-0 bg-[#617c43] transition-all duration-300 group-hover:w-full" />
    </article>
  );
}