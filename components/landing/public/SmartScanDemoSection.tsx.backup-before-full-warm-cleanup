"use client";

import {
  CheckCircle2,
  Mail,
  PackageCheck,
  ScanBarcode,
  Sparkles,
} from "lucide-react";

import { motion } from "framer-motion";

const matchedFields = [
  {
    label: "Product",
    value: "Belkin USB-C 4-in-1 Hub",
  },
  {
    label: "Brand",
    value: "Belkin",
  },
  {
    label: "Model",
    value: "AVC019TTDG-RL",
  },
  {
    label: "Category",
    value: "Computer accessory",
  },
  {
    label: "Match",
    value: "Database match",
  },
];

export default function SmartScanDemoSection() {
  return (
    <section
      id="smart-scan-demo"
      className="relative overflow-hidden bg-[#eee9df] px-5 py-24 text-[#101a22] md:px-8 md:py-32 lg:px-12"
    >
      <div className="pointer-events-none absolute -right-52 top-10 h-[620px] w-[620px] rounded-full bg-[#718d4f]/10 blur-[130px]" />

      <div className="relative mx-auto max-w-[1240px]">
        {/* INTRO */}

        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-7 bg-[#617c43]" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#617c43]">
                Smart Scan
              </p>
            </div>

            <h2 className="mt-5 max-w-xl font-serif text-4xl font-medium leading-[1.03] tracking-[-0.045em] text-[#101a22] sm:text-5xl lg:text-[3.5rem]">
              Scan it.
              <br />

              <span className="text-[#617c43]">
                We&apos;ll fill the details.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-xl text-base leading-8 text-[#5f6a72]">
              Adding a device shouldn&apos;t mean
              typing every model number by hand.
              Scan the UPC or EAN barcode and
              Home Tech Vault identifies the
              product and prepares the important
              details for you.
            </p>
          </div>
        </div>

        {/* STEPS */}

        <div className="mt-14 grid border-l border-t border-[#182533]/10 md:grid-cols-3">
          <StepCard
            number="01"
            icon={ScanBarcode}
            title="Scan"
            description="Point your camera at the barcode already printed on the box or product."
          />

          <StepCard
            number="02"
            icon={Sparkles}
            title="We match"
            description="Smart Scan looks up the product and fills useful model and device information."
          />

          <StepCard
            number="03"
            icon={CheckCircle2}
            title="You save"
            description="Review the match, add anything personal like location or serial number, and save."
          />
        </div>

        {/* SMART SCAN DEMO */}

        <div className="mt-20 grid gap-10 lg:grid-cols-[0.9fr_auto_1.1fr] lg:items-center">
          {/* CAMERA / BARCODE */}

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
            className="overflow-hidden rounded-[28px] border border-[#182533]/10 bg-[#f8f5ef] shadow-[0_30px_70px_-45px_rgba(15,25,35,0.45)]"
          >
            <div className="flex items-center justify-between border-b border-[#182533]/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#172432] text-[#dce3e7]">
                  <ScanBarcode
                    size={18}
                    strokeWidth={1.7}
                  />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#849097]">
                    Smart Scan
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#17212a]">
                    Scan product barcode
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-[#182533]/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7a858d]">
                Demo
              </span>
            </div>

            <div className="p-6 sm:p-7">
              <div className="relative overflow-hidden rounded-[24px] border border-[#182533]/10 bg-[#e6e0d5] px-6 py-8">
                {/* SCANNER CORNERS */}

                <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-[#617c43]" />
                <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-[#617c43]" />
                <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-[#617c43]" />
                <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-[#617c43]" />

                <motion.div
                  animate={{
                    y: [
                      -62,
                      62,
                      -62,
                    ],
                  }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute left-7 right-7 top-1/2 h-px bg-[#617c43] shadow-[0_0_12px_rgba(97,124,67,0.8)]"
                />

                <div className="mx-auto max-w-xs text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f8f5ef] text-[#617c43] shadow-sm">
                    <PackageCheck
                      size={28}
                      strokeWidth={1.5}
                    />
                  </div>

                  <p className="mt-5 font-serif text-xl text-[#17212a]">
                    Belkin USB-C Hub
                  </p>

                  <p className="mt-1 text-xs text-[#747e85]">
                    Product packaging
                  </p>

                  {/* BARCODE */}

                  <div className="mx-auto mt-7 max-w-[240px] rounded-xl bg-white px-5 py-4 shadow-sm">
                    <div className="flex h-14 items-stretch justify-center gap-[3px]">
                      {[
                        2, 1, 3, 1, 2, 4, 1,
                        3, 2, 1, 4, 2, 1, 3,
                        1, 2, 4, 1, 2, 3, 1,
                        4, 2, 1, 3, 2, 1,
                      ].map(
                        (
                          width,
                          index
                        ) => (
                          <span
                            key={index}
                            className="block bg-[#17212a]"
                            style={{
                              width:
                                width +
                                "px",
                            }}
                          />
                        )
                      )}
                    </div>

                    <p className="mt-2 font-mono text-[10px] tracking-[0.18em] text-[#53606a]">
                      745883896769
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-[#617c43]">
                <CheckCircle2
                  size={14}
                />

                Barcode detected
              </div>
            </div>
          </motion.div>

          {/* CONNECTOR */}

          <div className="relative hidden h-full w-28 items-center justify-center lg:flex">
            <div className="absolute left-0 right-0 h-px bg-[#182533]/15" />

            <motion.div
              initial={{
                x: -32,
                opacity: 0,
              }}
              whileInView={{
                x: 32,
                opacity: [
                  0,
                  1,
                  1,
                  0,
                ],
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
              <Sparkles
                size={15}
              />
            </motion.div>
          </div>

          <div className="relative mx-auto flex h-20 w-px items-center justify-center bg-[#182533]/15 lg:hidden">
            <motion.div
              initial={{
                y: -20,
                opacity: 0,
              }}
              whileInView={{
                y: 20,
                opacity: [
                  0,
                  1,
                  1,
                  0,
                ],
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
              <Sparkles
                size={15}
              />
            </motion.div>
          </div>

          {/* MATCH */}

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
            <div className="border-b border-white/10 bg-[#132536] px-6 py-5 sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#718d4f]/30 bg-[#718d4f]/10 text-[#8ca667]">
                    <Sparkles
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8ca667]">
                      Smart Scan
                    </p>

                    <p className="mt-1 text-xs text-white/45">
                      Product recognized
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-[#718d4f]/25 bg-[#718d4f]/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#8ca667]">
                  Match
                </span>
              </div>

              <h3 className="mt-6 font-serif text-2xl leading-tight text-[#f4f0e8] sm:text-3xl">
                Belkin USB-C
                <br />
                4-in-1 Hub
              </h3>

              <p className="mt-2 text-xs leading-5 text-white/45">
                Review the product match before
                adding it to your Vault.
              </p>
            </div>

            <div className="space-y-px bg-white/10">
              {matchedFields.map(
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
                        1.15 +
                        index *
                          0.1,
                    }}
                    className="grid grid-cols-[0.7fr_1.3fr] bg-[#101d2b] px-6 py-4 sm:px-8"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.11em] text-white/30">
                      {
                        field.label
                      }
                    </span>

                    <span className="text-right text-sm font-medium text-[#e4e9ec]">
                      {
                        field.value
                      }
                    </span>
                  </motion.div>
                )
              )}
            </div>

            <div className="border-t border-white/10 p-6 sm:p-8">
              <div className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#8ba866]/40 bg-[#617c43] px-5 text-sm font-semibold text-white shadow-[0_16px_35px_-20px_rgba(97,124,67,0.9)]">
                <CheckCircle2
                  size={16}
                />

                Ready to Add
              </div>

              <p className="mt-4 text-center text-[10px] text-white/35">
                You stay in control of what
                gets saved.
              </p>
            </div>
          </motion.div>
        </div>

        {/* SMART IMPORT SECONDARY FEATURE */}

        <div className="mx-auto mt-14 max-w-4xl rounded-[26px] border border-[#182533]/10 bg-[#e4ded3] p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f8f5ef] text-[#617c43] shadow-sm">
              <Mail
                size={19}
                strokeWidth={1.7}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
                Also included · Smart Import
              </p>

              <h3 className="mt-1 font-serif text-xl text-[#17212a]">
                Already have the receipt?
                Forward it instead.
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#68737a]">
                Every account also gets a
                private Smart Import email.
                Forward a receipt or purchase
                confirmation and Home Tech Vault
                extracts the useful purchase
                details for you to review.
              </p>
            </div>

            <div className="shrink-0 rounded-full border border-[#617c43]/20 bg-[#617c43]/10 px-4 py-2 text-xs font-semibold text-[#617c43]">
              Scan or forward
            </div>
          </div>
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
  icon: typeof ScanBarcode;
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
