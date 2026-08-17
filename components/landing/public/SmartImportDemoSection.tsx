"use client";

import {
  Check,
  CheckCircle2,
  Forward,
  Mail,
  Sparkles,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

const fields = [
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
    label: "Purchase date",
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
      className="border-y border-border-subtle bg-surface-card px-5 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-[var(--content-max)]">
        {/* HEADER */}

        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-home-health-soft px-3 py-1.5 text-xs font-semibold text-home-health">
            <Sparkles
              size={14}
              aria-hidden
            />

            Smart Import™
          </div>

          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-text-primary sm:text-4xl lg:text-5xl">
            Forward it.
            <br />
            We&apos;ll do the typing.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary">
            You already receive order
            confirmations when you buy
            something. Smart Import turns
            those emails into organized
            device records without making
            you enter everything twice.
          </p>
        </div>

        {/* THREE STEPS */}

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <StepCard
            number="1"
            icon={Forward}
            title="Forward"
            description="Send the receipt or order confirmation you already have."
          />

          <StepCard
            number="2"
            icon={Sparkles}
            title="We organize it"
            description="Home Tech Vault pulls out useful product and purchase details."
          />

          <StepCard
            number="3"
            icon={CheckCircle2}
            title="You approve"
            description="Review everything before anything is added to your Vault."
          />
        </div>

        {/* ANIMATED PRODUCT DEMO */}

        <div className="mx-auto mt-16 max-w-2xl">
          {/* RECEIPT CARD */}

          <motion.div
            initial={{
              opacity: 0,
              y: -24,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.35,
            }}
            transition={{
              duration: 0.55,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
            className="rounded-[26px] border border-border-subtle bg-surface-base p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-sunken text-text-secondary">
                  <Mail
                    size={19}
                    aria-hidden
                  />
                </div>

                <div>
                  <p className="text-xs text-text-muted">
                    Order confirmation
                  </p>

                  <p className="text-sm font-semibold text-text-primary">
                    Best Buy
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-surface-sunken px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                Demo
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-border-subtle bg-surface-card p-4">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                    Your order
                  </p>

                  <p className="mt-1 font-semibold text-text-primary">
                    LG 34&quot; UltraWide
                    Monitor
                  </p>

                  <p className="mt-1 text-xs text-text-muted">
                    Ordered Aug 12, 2026
                  </p>
                </div>

                <p className="shrink-0 font-semibold text-text-primary">
                  $349.99
                </p>
              </div>
            </div>
          </motion.div>

          {/* FIRST ANIMATED CONNECTOR */}

          <div className="relative mx-auto h-24 w-px overflow-hidden bg-border-subtle">
            <motion.div
              initial={{
                y: -96,
              }}
              whileInView={{
                y: 96,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 1.1,
                delay: 0.35,
                ease: "easeInOut",
              }}
              className="absolute left-0 top-0 h-12 w-px bg-home-health"
            />
          </div>

          {/* FORWARD ADDRESS */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 8,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.45,
              delay: 0.7,
            }}
            className="mx-auto max-w-lg rounded-[22px] border border-home-health/20 bg-home-health-soft/60 px-5 py-5 text-center shadow-sm"
          >
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-home-health text-white">
              <Forward
                size={17}
                aria-hidden
              />
            </div>

            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-home-health">
              Forwarded to Smart Import
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-text-primary sm:text-base">
              demo.user@fuevwun.resend.app
            </p>

            <p className="mt-2 text-xs text-text-muted">
              Every customer gets their own
              private Smart Import address.
            </p>
          </motion.div>

          {/* SECOND CONNECTOR */}

          <div className="relative mx-auto h-24 w-px overflow-hidden bg-border-subtle">
            <motion.div
              initial={{
                y: -96,
              }}
              whileInView={{
                y: 96,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 1,
                delay: 1.05,
                ease: "easeInOut",
              }}
              className="absolute left-0 top-0 h-12 w-px bg-home-health"
            />
          </div>

          {/* SMART IMPORT RESULT */}

          <motion.div
            initial={{
              opacity: 0,
              y: 26,
              scale: 0.98,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.55,
              delay: 1.35,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
            className="overflow-hidden rounded-[28px] border border-home-health/20 bg-surface-base shadow-lg"
          >
            {/* RESULT HEADER */}

            <div className="border-b border-border-subtle bg-home-health-soft/35 p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    rotate: [
                      0,
                      12,
                      -8,
                      0,
                    ],
                    scale: [
                      1,
                      1.15,
                      1,
                    ],
                  }}
                  transition={{
                    duration: 1.4,
                    delay: 1.65,
                  }}
                >
                  <Sparkles
                    size={18}
                    className="text-home-health"
                    aria-hidden
                  />
                </motion.div>

                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-home-health">
                  Smart Import™ found this
                </p>
              </div>

              <motion.h3
                initial={{
                  opacity: 0,
                  x: -10,
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
                  delay: 1.75,
                }}
                className="mt-3 text-xl font-semibold tracking-tight text-text-primary sm:text-2xl"
              >
                LG 34&quot; UltraWide Monitor
              </motion.h3>

              <motion.p
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
                  delay: 1.9,
                }}
                className="mt-1 text-sm text-text-secondary"
              >
                Review what we found before
                adding it to your Vault.
              </motion.p>
            </div>

            {/* FIELDS */}

            <div className="p-5 sm:p-6">
              <div className="space-y-2.5">
                {fields.map(
                  (
                    field,
                    index
                  ) => (
                    <motion.div
                      key={
                        field.label
                      }
                      initial={{
                        opacity: 0,
                        x: 18,
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
                          2 +
                          index *
                            0.14,
                      }}
                      className="flex items-center justify-between gap-5 rounded-xl bg-surface-sunken/60 px-4 py-3"
                    >
                      <span className="text-xs text-text-muted">
                        {field.label}
                      </span>

                      <span className="text-right text-xs font-semibold text-text-primary sm:text-sm">
                        {field.value}
                      </span>
                    </motion.div>
                  )
                )}
              </div>

              {/* APPROVE BUTTON */}

              <motion.button
                initial={{
                  opacity: 0,
                  scale: 0.96,
                  y: 6,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.4,
                  delay: 2.9,
                }}
                type="button"
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-home-health text-sm font-semibold text-white shadow-sm"
              >
                <Check
                  size={16}
                  aria-hidden
                />

                Add to My Vault
              </motion.button>

              <motion.p
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
                  delay: 3.1,
                }}
                className="mt-3 text-center text-[11px] text-text-muted"
              >
                Nothing is added until you
                approve it.
              </motion.p>
            </div>
          </motion.div>
        </div>
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
    <article className="rounded-[24px] border border-border-subtle bg-surface-base p-6">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
          <Icon
            size={19}
            aria-hidden
          />
        </div>

        <span className="text-sm font-bold text-text-muted">
          0{number}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-semibold text-text-primary">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {description}
      </p>
    </article>
  );
}