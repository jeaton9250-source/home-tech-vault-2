"use client";

import {
  Check,
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

export default function SmartImportAnimatedDemo() {
  return (
    <div className="relative mx-auto max-w-2xl">
      {/* RECEIPT */}

      <motion.div
        initial={{
          opacity: 0,
          y: -20,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.4,
        }}
        transition={{
          duration: 0.5,
        }}
        className="rounded-[24px] border border-border-subtle bg-surface-card p-5 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-sunken">
            <Mail
              size={18}
              className="text-text-secondary"
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

        <div className="mt-4 rounded-2xl bg-surface-base p-4">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="font-semibold text-text-primary">
                LG 34&quot; UltraWide Monitor
              </p>

              <p className="mt-1 text-xs text-text-muted">
                Ordered Aug 12, 2026
              </p>
            </div>

            <p className="font-semibold text-text-primary">
              $349.99
            </p>
          </div>
        </div>
      </motion.div>

      {/* CONNECTING LINE */}

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
            amount: 0.3,
          }}
          transition={{
            duration: 1.2,
            delay: 0.4,
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
        }}
        whileInView={{
          opacity: 1,
          scale: 1,
        }}
        viewport={{
          once: true,
        }}
        transition={{
          duration: 0.45,
          delay: 0.7,
        }}
        className="mx-auto max-w-md rounded-2xl border border-home-health/20 bg-home-health-soft px-5 py-4 text-center"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-home-health">
          Forwarded to Smart Import
        </p>

        <p className="mt-1 break-all text-sm font-semibold text-text-primary">
          demo.user@fuevwun.resend.app
        </p>
      </motion.div>

      {/* SECOND LINE */}

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
            delay: 1.1,
            ease: "easeInOut",
          }}
          className="absolute left-0 top-0 h-12 w-px bg-home-health"
        />
      </div>

      {/* IMPORT RESULT */}

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
        }}
        transition={{
          duration: 0.5,
          delay: 1.4,
        }}
        className="overflow-hidden rounded-[28px] border border-home-health/20 bg-surface-card shadow-lg"
      >
        <div className="border-b border-border-subtle bg-home-health-soft/30 p-5">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                rotate: [0, 12, -8, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 1.5,
                delay: 1.7,
              }}
            >
              <Sparkles
                size={18}
                className="text-home-health"
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
              delay: 1.8,
            }}
            className="mt-3 text-xl font-semibold tracking-tight text-text-primary"
          >
            LG 34&quot; UltraWide Monitor
          </motion.h3>
        </div>

        <div className="p-5">
          <div className="space-y-2">
            {fields.map(
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
                      2 +
                      index * 0.16,
                  }}
                  className="flex items-center justify-between gap-5 rounded-xl bg-surface-sunken/60 px-4 py-3"
                >
                  <span className="text-xs text-text-muted">
                    {field.label}
                  </span>

                  <span className="text-right text-xs font-semibold text-text-primary">
                    {field.value}
                  </span>
                </motion.div>
              )
            )}
          </div>

          <motion.button
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.4,
              delay: 3,
            }}
            type="button"
            className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-home-health text-sm font-semibold text-white"
          >
            <Check
              size={16}
              aria-hidden
            />

            Add to My Vault
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}