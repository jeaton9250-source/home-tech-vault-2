"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  CircleHelp,
} from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";

const faqs = [
  {
    question: "Do I have to add my entire house at once?",
    answer:
      "No. Home Tech Vault is designed so you can start with one device and build from there. Add your TV today, your refrigerator later, and your router whenever you have time. Your vault can grow naturally over time.",
  },
  {
    question: "Is Home Tech Vault really free to start?",
    answer:
      "Yes. You can start with the Free plan and organize up to 8 devices and 25 documents. No credit card is required to get started.",
  },
  {
    question: "What kinds of devices can I add?",
    answer:
      "You can use Home Tech Vault for TVs, computers, laptops, routers, refrigerators, washers, dryers, gaming consoles, smart-home devices, speakers, printers, cameras, appliances, and other technology or equipment you want to keep organized.",
  },
  {
    question: "What can I save with each device?",
    answer:
      "You can keep useful information such as the brand, model number, serial number, purchase date, purchase price, warranty details, notes, receipts, manuals, and other supporting documents connected to the device they belong to.",
  },
  {
    question: "Why not just keep everything in Google Drive or email?",
    answer:
      "You can, but those tools store files rather than organizing everything around the device itself. Home Tech Vault gives each device its own record so the receipt, warranty, manual, serial number, purchase information, and notes can stay together.",
  },
  {
    question: "Do I need the Mac connector to use Home Tech Vault?",
    answer:
      "No. You can add and manage devices manually from your browser. The optional Mac connector is only for supported device-discovery features and is not required to build or use your vault.",
  },
  {
    question: "Can I store appliances too?",
    answer:
      "Yes. Home Tech Vault is useful for more than computers and electronics. Refrigerators, washers, dryers, televisions, routers, smart-home equipment, and other household appliances or technology can all be tracked.",
  },
  {
    question: "Can other people in my household use the vault?",
    answer:
      "Home Tech Vault supports household access features so important information does not have to live with only one person. Available access options may depend on your plan.",
  },
  {
    question: "What happens if something breaks?",
    answer:
      "That is one of the main reasons to build your vault before you need it. Open the device record and you can have important information such as the model number, serial number, receipt, warranty details, manual, and purchase information in one place.",
  },
  {
    question: "What if I do not have the receipt or warranty right now?",
    answer:
      "That is completely fine. Start with the information you have. You can add documents and additional details later. Home Tech Vault does not require every field to be completed before a device becomes useful.",
  },
  {
    question: "Can I upgrade later?",
    answer:
      "Yes. Start with the Free plan and upgrade if you eventually need more devices, more document storage, household features, or additional Home Tech Vault capabilities.",
  },
  {
    question: "Is my information public?",
    answer:
      "Your vault is intended for private household use, not as a public profile. You control what information you add and who you choose to share household access with.",
  },
];

export default function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative overflow-hidden bg-surface-sunken/35 px-5 py-20 md:px-8 md:py-24 lg:px-12">
      <div className={landingTheme.sectionNarrow}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className={`${landingTheme.pill} mx-auto`}>
            <CircleHelp
              size={14}
              className="text-home-health"
              aria-hidden
            />
            <span>Questions before you start?</span>
          </div>

          <h2 className="mt-6 text-3xl font-medium tracking-[-0.04em] text-text-primary sm:text-4xl md:text-5xl">
            Home Tech Vault should be
            <span className="block bg-gradient-to-r from-text-primary via-home-health to-premium bg-clip-text text-transparent">
              simple to understand.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
            Here are the questions someone should be able to answer before
            deciding whether Home Tech Vault belongs in their home.
          </p>
        </motion.div>

        {/* FAQ list */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto mt-14 max-w-4xl space-y-3"
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-card"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-text-primary sm:text-base">
                    {faq.question}
                  </span>

                  <motion.div
                    animate={{
                      rotate: isOpen ? 180 : 0,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-text-muted"
                  >
                    <ChevronDown
                      size={16}
                      aria-hidden
                    />
                  </motion.div>
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.25,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border-subtle/70 px-5 py-5 sm:px-6">
                    <p className="max-w-3xl text-sm leading-6 text-text-secondary">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* Closing reassurance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
          }}
          className="mx-auto mt-12 max-w-2xl text-center"
        >
          <p className="text-lg font-semibold tracking-tight text-text-primary">
            You do not have to organize everything today.
          </p>

          <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">
            Start free, add one device, and decide from there whether Home Tech
            Vault makes managing the things around your home easier.
          </p>
        </motion.div>
      </div>
    </section>
  );
}