"use client";

import {
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Laptop,
  Receipt,
  ScanBarcode,
  ShieldCheck,
  Users,
  Wifi,
} from "lucide-react";

type AnswerValue =
  | "yes"
  | "somewhat"
  | "not_yet";

type CategoryId =
  | "inventory"
  | "proof"
  | "documents"
  | "network"
  | "household";

type Question = {
  id: number;
  category: CategoryId;
  weight: number;
  question: string;
  detail: string;
};

const categoryOrder: CategoryId[] = [
  "inventory",
  "proof",
  "documents",
  "network",
  "household",
];

const categoryMeta = {
  inventory: {
    label: "Device Records",
    icon: Laptop,
    recommendation:
      "Start with the devices you would least want to identify from scratch. Smart Scan can help fill product details from a barcode.",
    ctaLabel: "Start my device inventory",
  },

  proof: {
    label: "Receipts & Warranties",
    icon: ShieldCheck,
    recommendation:
      "Connect proof of purchase and warranty information to the device it protects so you are ready when something breaks.",
    ctaLabel: "Organize my warranties",
  },

  documents: {
    label: "Manuals & Documents",
    icon: Receipt,
    recommendation:
      "Give manuals, receipts, setup guides, and supporting files one dependable home instead of several folders and inboxes.",
    ctaLabel: "Build my document vault",
  },

  network: {
    label: "Network Readiness",
    icon: Wifi,
    recommendation:
      "Document your router, internet provider, and key network equipment before an outage turns into a search project.",
    ctaLabel: "Document my network",
  },

  household: {
    label: "Household Access",
    icon: Users,
    recommendation:
      "Create one shared source of truth so important home technology information does not depend on one person's memory.",
    ctaLabel: "Create my household vault",
  },
} satisfies Record<
  CategoryId,
  {
    label: string;
    icon: typeof Laptop;
    recommendation: string;
    ctaLabel: string;
  }
>;

const questions: Question[] = [
  {
    id: 1,
    category: "inventory",
    weight: 12,
    question:
      "Could you find the model and serial number of an important device in under a minute?",
    detail:
      "Think about your TV, laptop, refrigerator, router, or another major device.",
  },
  {
    id: 2,
    category: "proof",
    weight: 12,
    question:
      "Do you know which of your major devices are still under warranty?",
    detail:
      "Not just whether you bought coverage — whether you could confirm it today.",
  },
  {
    id: 3,
    category: "proof",
    weight: 8,
    question:
      "Could you find the receipt for an expensive device without searching multiple places?",
    detail:
      "Email, paper folders, retailer accounts, cloud drives — how many places would you need to check?",
  },
  {
    id: 4,
    category: "documents",
    weight: 8,
    question:
      "Do you know where the manuals or setup guides for your important appliances and electronics are?",
    detail:
      "The goal is being able to reach the right document when you actually need it.",
  },
  {
    id: 5,
    category: "household",
    weight: 12,
    question:
      "Could someone else in your household find important tech details without asking you?",
    detail:
      "Imagine you were traveling, unavailable, or simply not home.",
  },
  {
    id: 6,
    category: "inventory",
    weight: 8,
    question:
      "Do you have one place showing the important technology you own and where it is?",
    detail:
      "A useful inventory should tell you what you have without walking room to room.",
  },
  {
    id: 7,
    category: "household",
    weight: 8,
    question:
      "Could you quickly document your electronics after theft, damage, or an insurance claim?",
    detail:
      "Think device names, purchase information, serial numbers, photos, and proof of ownership.",
  },
  {
    id: 8,
    category: "network",
    weight: 12,
    question:
      "Could you quickly find your router, Wi-Fi equipment, and internet provider details?",
    detail:
      "The information that becomes important during an outage, move, replacement, or support call.",
  },
  {
    id: 9,
    category: "documents",
    weight: 12,
    question:
      "When you buy a new device, do you have a repeatable way to save its important information?",
    detail:
      "Receipt, warranty, model information, manual, and other records should have somewhere to go.",
  },
  {
    id: 10,
    category: "network",
    weight: 8,
    question:
      "If your internet stopped tonight, could you quickly find what you need to troubleshoot or call support?",
    detail:
      "Not whether you could eventually figure it out — whether the useful information is already organized.",
  },
];

const answerMultiplier: Record<
  AnswerValue,
  number
> = {
  yes: 1,
  somewhat: 0.5,
  not_yet: 0,
};

const answers: {
  value: AnswerValue;
  label: string;
  description: string;
}[] = [
  {
    value: "yes",
    label: "Yes",
    description: "I can do this now",
  },
  {
    value: "somewhat",
    label: "Somewhat",
    description:
      "I could, but it would take some searching",
  },
  {
    value: "not_yet",
    label: "Not yet",
    description:
      "I don't have a reliable system for this",
  },
];

function getResult(score: number) {
  if (score >= 90) {
    return {
      label: "Vault Ready",
      eyebrow: "Excellent foundation",
      description:
        "Your home technology records are unusually well prepared. Home Tech Vault can help you keep them organized as your home changes.",
    };
  }

  if (score >= 70) {
    return {
      label: "Well Organized",
      eyebrow: "Strong foundation",
      description:
        "You already have a good handle on your home technology. A few gaps are keeping everything from being truly ready when you need it.",
    };
  }

  if (score >= 40) {
    return {
      label: "Partially Prepared",
      eyebrow: "The pieces are there",
      description:
        "You have some of the information you need — it is just not consistently organized in one dependable place.",
    };
  }

  return {
    label: "Needs a Foundation",
    eyebrow: "A few important gaps",
    description:
      "Your home technology information may be difficult to retrieve quickly today. You do not need to fix everything at once.",
  };
}

export default function HomeTechReadinessCheck() {
  const [
    selectedAnswers,
    setSelectedAnswers,
  ] = useState<
    Record<number, AnswerValue>
  >({});

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    showingResults,
    setShowingResults,
  ] = useState(false);

  const currentQuestion =
    questions[currentIndex];

  const answeredCount =
    Object.keys(selectedAnswers).length;

  const progress =
    (answeredCount / questions.length) *
    100;

  const overallScore = useMemo(() => {
    const points = questions.reduce(
      (total, question) => {
        const answer =
          selectedAnswers[
            question.id
          ];

        if (!answer) {
          return total;
        }

        return (
          total +
          question.weight *
            answerMultiplier[answer]
        );
      },
      0
    );

    return Math.round(points);
  }, [selectedAnswers]);

  const categoryScores = useMemo(
    () =>
      categoryOrder.map(
        (categoryId) => {
          const categoryQuestions =
            questions.filter(
              (question) =>
                question.category ===
                categoryId
            );

          const maxPoints =
            categoryQuestions.reduce(
              (total, question) =>
                total +
                question.weight,
              0
            );

          const earnedPoints =
            categoryQuestions.reduce(
              (total, question) => {
                const answer =
                  selectedAnswers[
                    question.id
                  ];

                if (!answer) {
                  return total;
                }

                return (
                  total +
                  question.weight *
                    answerMultiplier[
                      answer
                    ]
                );
              },
              0
            );

          return {
            id: categoryId,
            score:
              maxPoints > 0
                ? Math.round(
                    (earnedPoints /
                      maxPoints) *
                      100
                  )
                : 0,
            ...categoryMeta[
              categoryId
            ],
          };
        }
      ),
    [selectedAnswers]
  );

  const weakestCategories = useMemo(
    () =>
      [...categoryScores]
        .sort(
          (a, b) =>
            a.score - b.score
        )
        .slice(0, 3),
    [categoryScores]
  );

  const result =
    getResult(overallScore);

  const primaryCategory =
    weakestCategories[0];

  function chooseAnswer(
    value: AnswerValue
  ) {
    if (!currentQuestion) {
      return;
    }

    const nextAnswers = {
      ...selectedAnswers,
      [currentQuestion.id]: value,
    };

    setSelectedAnswers(
      nextAnswers
    );

    if (
      currentIndex ===
      questions.length - 1
    ) {
      setShowingResults(true);
      return;
    }

    setCurrentIndex(
      (value) => value + 1
    );
  }

  function goBack() {
    if (showingResults) {
      setShowingResults(false);
      setCurrentIndex(
        questions.length - 1
      );
      return;
    }

    setCurrentIndex(
      (value) =>
        Math.max(0, value - 1)
    );
  }

  function restart() {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowingResults(false);
  }

  return (
    <section
      id="home-tech-readiness"
      className="relative overflow-hidden bg-[#eee9df] px-5 py-24 text-[#17212a] md:px-8 md:py-32 lg:px-12"
    >
      <div className="pointer-events-none absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-[#617c43]/10 blur-[120px]" />

      <div className="relative mx-auto max-w-[1120px]">
        {!showingResults ? (
          <>
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#617c43]/20 bg-[#617c43]/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#617c43]">
                <ShieldCheck
                  size={14}
                  aria-hidden
                />

                60-second home tech check
              </div>

              <h2 className="mt-6 font-serif text-4xl font-medium leading-[1.04] tracking-[-0.045em] sm:text-5xl md:text-[3.6rem]">
                How prepared is your home
                <span className="block text-[#617c43]">
                  when tech goes wrong?
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#657078] sm:text-lg">
                Answer 10 quick
                questions. Get a
                personalized readiness
                score and see which
                parts of your home tech
                setup are worth
                organizing next.
              </p>

              <p className="mt-3 text-xs font-medium text-[#8a9399]">
                No account or email
                required.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-3xl">
              <div className="mb-4 flex items-center justify-between text-xs font-semibold">
                <span className="text-[#67727a]">
                  Question{" "}
                  {currentIndex + 1} of{" "}
                  {questions.length}
                </span>

                <span className="text-[#617c43]">
                  {answeredCount}/
                  {questions.length} answered
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-[#d9d3c9]">
                <motion.div
                  className="h-full rounded-full bg-[#617c43]"
                  animate={{
                    width: `${progress}%`,
                  }}
                  transition={{
                    duration: 0.35,
                    ease: [
                      0.22,
                      1,
                      0.36,
                      1,
                    ],
                  }}
                />
              </div>
            </div>

            {currentQuestion ? (
              <motion.div
                key={
                  currentQuestion.id
                }
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.32,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
                className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-[30px] border border-[#182533]/10 bg-[#f8f5ef] shadow-[0_30px_70px_-48px_rgba(15,25,35,.55)]"
              >
                <div className="border-b border-[#182533]/10 px-6 py-6 sm:px-8">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#617c43]">
                    {
                      categoryMeta[
                        currentQuestion
                          .category
                      ].label
                    }
                  </p>

                  <h3 className="mt-3 font-serif text-2xl leading-snug tracking-[-0.025em] sm:text-3xl">
                    {
                      currentQuestion.question
                    }
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#707a81]">
                    {
                      currentQuestion.detail
                    }
                  </p>
                </div>

                <div className="grid gap-3 p-5 sm:p-6">
                  {answers.map(
                    (answer) => {
                      const selected =
                        selectedAnswers[
                          currentQuestion
                            .id
                        ] ===
                        answer.value;

                      return (
                        <button
                          key={
                            answer.value
                          }
                          type="button"
                          aria-pressed={
                            selected
                          }
                          onClick={() =>
                            chooseAnswer(
                              answer.value
                            )
                          }
                          className={`group flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition ${
                            selected
                              ? "border-[#617c43]/40 bg-[#617c43]/10"
                              : "border-[#182533]/10 bg-white/45 hover:border-[#617c43]/25 hover:bg-white/80"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${
                              selected
                                ? "border-[#617c43] bg-[#617c43] text-white"
                                : "border-[#182533]/15 bg-[#f8f5ef] text-[#8a9399] group-hover:border-[#617c43]/40 group-hover:text-[#617c43]"
                            }`}
                          >
                            {selected ? (
                              <CheckCircle2
                                size={
                                  18
                                }
                                aria-hidden
                              />
                            ) : (
                              <span className="h-2.5 w-2.5 rounded-full border border-current" />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-[#17212a] sm:text-base">
                              {
                                answer.label
                              }
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#747e85]">
                              {
                                answer.description
                              }
                            </p>
                          </div>

                          <ArrowRight
                            size={16}
                            className="ml-auto shrink-0 text-[#a1a8ad] transition group-hover:translate-x-0.5 group-hover:text-[#617c43]"
                            aria-hidden
                          />
                        </button>
                      );
                    }
                  )}
                </div>
              </motion.div>
            ) : null}

            <div className="mx-auto mt-5 flex max-w-3xl items-center justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={
                  currentIndex === 0
                }
                className="text-xs font-semibold text-[#7b858c] transition hover:text-[#17212a] disabled:pointer-events-none disabled:opacity-0"
              >
                ← Previous question
              </button>

              <span className="text-[10px] uppercase tracking-[0.12em] text-[#9aa1a5]">
                About 60 seconds
              </span>
            </div>
          </>
        ) : (
          <motion.div
            initial={{
              opacity: 0,
              y: 24,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
          >
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
                Your Home Tech
                Readiness
              </p>

              <div className="mx-auto mt-6 flex h-32 w-32 flex-col items-center justify-center rounded-full border-[10px] border-[#617c43]/15 bg-[#f8f5ef] shadow-sm">
                <span className="font-serif text-4xl font-medium tracking-[-0.05em] text-[#17212a]">
                  {overallScore}
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d878e]">
                  out of 100
                </span>
              </div>

              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.13em] text-[#8a9399]">
                {result.eyebrow}
              </p>

              <h2 className="mt-2 font-serif text-4xl tracking-[-0.04em] text-[#17212a] sm:text-5xl">
                {result.label}
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#667179]">
                {
                  result.description
                }
              </p>
            </div>

            {/* CATEGORY SCORES */}

            <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-[28px] border border-[#182533]/10 bg-[#f8f5ef]">
              <div className="border-b border-[#182533]/10 px-6 py-5 sm:px-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#889198]">
                  Your breakdown
                </p>

                <h3 className="mt-1 font-serif text-2xl text-[#17212a]">
                  Where your home is
                  strongest — and where
                  it has gaps.
                </h3>
              </div>

              <div className="divide-y divide-[#182533]/10">
                {categoryScores.map(
                  (category) => {
                    const Icon =
                      category.icon;

                    return (
                      <div
                        key={
                          category.id
                        }
                        className="grid gap-4 px-6 py-5 sm:grid-cols-[1fr_1.1fr_auto] sm:items-center sm:px-8"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#617c43]/10 text-[#617c43]">
                            <Icon
                              size={
                                16
                              }
                              aria-hidden
                            />
                          </div>

                          <span className="text-sm font-semibold text-[#17212a]">
                            {
                              category.label
                            }
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-[#ddd7cd]">
                          <motion.div
                            initial={{
                              width: 0,
                            }}
                            animate={{
                              width: `${category.score}%`,
                            }}
                            transition={{
                              duration:
                                0.65,
                              delay:
                                0.15,
                            }}
                            className="h-full rounded-full bg-[#617c43]"
                          />
                        </div>

                        <span className="w-12 text-right text-sm font-semibold tabular-nums text-[#17212a]">
                          {
                            category.score
                          }
                          %
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* BIGGEST GAPS */}

            <div className="mx-auto mt-12 max-w-4xl">
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#617c43]">
                  Your biggest
                  opportunities
                </p>

                <h3 className="mt-2 font-serif text-3xl tracking-[-0.035em] text-[#17212a]">
                  Start with these
                  three.
                </h3>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                {weakestCategories.map(
                  (
                    category,
                    index
                  ) => {
                    const Icon =
                      category.icon;

                    return (
                      <article
                        key={
                          category.id
                        }
                        className="rounded-[24px] border border-[#182533]/10 bg-[#f8f5ef] p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#617c43]/10 text-[#617c43]">
                            <Icon
                              size={
                                18
                              }
                              aria-hidden
                            />
                          </div>

                          <span className="font-serif text-sm text-[#9ca3a8]">
                            0
                            {index +
                              1}
                          </span>
                        </div>

                        <p className="mt-5 text-sm font-semibold text-[#17212a]">
                          {
                            category.label
                          }
                        </p>

                        <p className="mt-2 text-sm leading-6 text-[#6f7980]">
                          {
                            category.recommendation
                          }
                        </p>
                      </article>
                    );
                  }
                )}
              </div>
            </div>

            {/* PERSONALIZED CTA */}

            <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-[30px] bg-[#183047] p-7 text-[#f5f1e8] shadow-[0_35px_80px_-45px_rgba(0,0,0,.8)] sm:p-9">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="flex items-center gap-2 text-[#718d4f]">
                    <ScanBarcode
                      size={16}
                      aria-hidden
                    />

                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                      Your next step
                    </p>
                  </div>

                  <h3 className="mt-3 font-serif text-3xl leading-tight">
                    Fix your biggest
                    gap without
                    organizing the
                    whole house today.
                  </h3>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                    {
                      primaryCategory
                        ?.recommendation
                    }
                  </p>
                </div>

                <div className="flex min-w-[220px] flex-col gap-3">
                  <Link
                    href="/signup"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#617c43] px-5 text-sm font-semibold text-white transition hover:bg-[#718d4f]"
                  >
                    {primaryCategory
                      ?.ctaLabel ||
                      "Start my vault"}

                    <ArrowRight
                      size={16}
                      aria-hidden
                    />
                  </Link>

                  <a
                    href="#smart-scan-demo"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-semibold text-white/75 transition hover:bg-white/5 hover:text-white"
                  >
                    <ScanBarcode
                      size={15}
                      aria-hidden
                    />

                    See Smart Scan
                  </a>
                </div>
              </div>

              <div className="mt-7 border-t border-white/10 pt-5">
                <p className="text-xs leading-5 text-white/40">
                  Start free. Add one
                  device. Your vault
                  can grow from there.
                </p>
              </div>
            </div>

            <div className="mt-7 text-center">
              <button
                type="button"
                onClick={restart}
                className="text-xs font-semibold text-[#727d84] underline decoration-[#727d84]/30 underline-offset-4 transition hover:text-[#17212a]"
              >
                Retake the home tech
                check
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
