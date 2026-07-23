"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_FAQ_ITEMS,
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

export default function LandingFaq() {
  const [openQuestion, setOpenQuestion] = useState<
    string | null
  >(LANDING_FAQ_ITEMS[0]?.question ?? null);

  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.faq}
      className={cn(
        landingTheme.section,
        landingTheme.scrollAnchor
      )}
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className={landingTheme.eyebrow}>FAQ</p>
            <h2 className={cn(landingTheme.headline, "mt-3")}>
              Questions homeowners ask
            </h2>
          </div>

          <div className="mt-10 divide-y divide-[#E7E9EC] overflow-hidden rounded-[1.25rem] border border-[#E7E9EC] bg-white">
            {LANDING_FAQ_ITEMS.map((item) => {
              const isOpen =
                openQuestion === item.question;
              const panelId = `landing-faq-${item.question
                .replace(/\W+/g, "-")
                .toLowerCase()}`;

              return (
                <div key={item.question}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-[#FAFAF8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#183B56] md:px-6"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() =>
                      setOpenQuestion(
                        isOpen ? null : item.question
                      )
                    }
                  >
                    <span className="text-base font-medium text-[#172033]">
                      {item.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className={cn(
                        "shrink-0 text-[#667085] transition",
                        isOpen && "rotate-180"
                      )}
                      aria-hidden
                    />
                  </button>

                  {isOpen ? (
                    <div
                      id={panelId}
                      role="region"
                      className="px-5 pb-5 text-sm leading-7 text-[#667085] md:px-6"
                    >
                      {item.answer}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
