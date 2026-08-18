"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import HealthScoreRing from "@/components/health-check/HealthScoreRing";

import {
  HEALTH_CHECK_OPTIONS,
  HEALTH_CHECK_QUESTIONS,
} from "@/lib/health-check/questions";

import {
  calculateHealthCheck,
  type HealthCheckAnswers,
} from "@/lib/health-check/scoring";

const STORAGE_KEY =
  "htv_home_tech_health_check_v1";

function createAttemptId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return [
    Date.now().toString(16),
    Math.random()
      .toString(16)
      .slice(2),
    Math.random()
      .toString(16)
      .slice(2),
  ].join("-");
}

function readHealthCheckAttribution() {
  if (typeof window === "undefined") {
    return {
      source: null,
      campaign: null,
      referrerHost: null,
    };
  }

  const params =
    new URLSearchParams(
      window.location.search
    );

  const source =
    params.get("utm_source") ||
    params.get("source");

  const campaign =
    params.get("utm_campaign");

  let referrerHost: string | null = null;

  if (document.referrer) {
    try {
      referrerHost =
        new URL(document.referrer).hostname;
    } catch {
      referrerHost = null;
    }
  }

  return {
    source:
      source?.trim().toLowerCase() ||
      "direct",
    campaign:
      campaign?.trim() || null,
    referrerHost,
  };
}

async function recordHealthCheckCompletion(
  attemptId: string,
  score: number
) {
  const attribution =
    readHealthCheckAttribution();

  try {
    await fetch(
      "/api/public/health-check/completion",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        keepalive: true,
        body: JSON.stringify({
          attemptId,
          score,
          ...attribution,
        }),
      }
    );
  } catch {
    // Analytics must never interfere with the
    // public Health Check experience.
  }
}

type SavedState = {
  answers: HealthCheckAnswers;
  completed: boolean;
};

export default function HomeTechHealthCheck() {
  const attemptIdRef = useRef<string>(
    createAttemptId()
  );

  const [started, setStarted] =
    useState(false);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState<HealthCheckAnswers>({});

  const [completed, setCompleted] =
    useState(false);

  const [hydrated, setHydrated] =
    useState(false);

  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(
          STORAGE_KEY
        );

      if (saved) {
        const parsed =
          JSON.parse(saved) as SavedState;

        if (
          parsed &&
          typeof parsed === "object"
        ) {
          setAnswers(
            parsed.answers ?? {}
          );

          setCompleted(
            Boolean(parsed.completed)
          );

          if (parsed.completed) {
            setStarted(true);
          }
        }
      }
    } catch {
      // Health Check remains fully usable
      // when localStorage is unavailable.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          answers,
          completed,
        } satisfies SavedState)
      );
    } catch {
      // Persistence is optional.
    }
  }, [
    answers,
    completed,
    hydrated,
  ]);

  const question =
    HEALTH_CHECK_QUESTIONS[
      currentIndex
    ];

  const result = useMemo(
    () =>
      calculateHealthCheck(
        answers
      ),
    [answers]
  );

  const answeredCount =
    Object.keys(answers).length;

  const progress =
    HEALTH_CHECK_QUESTIONS.length > 0
      ? Math.round(
          (answeredCount /
            HEALTH_CHECK_QUESTIONS.length) *
            100
        )
      : 0;

  function chooseAnswer(
    questionId: string,
    value: number
  ) {
    const nextAnswers = {
      ...answers,
      [questionId]: value,
    };

    setAnswers(nextAnswers);

    if (
      currentIndex ===
      HEALTH_CHECK_QUESTIONS.length -
        1
    ) {
      const finalResult =
        calculateHealthCheck(
          nextAnswers
        );

      setCompleted(true);

      void recordHealthCheckCompletion(
        attemptIdRef.current,
        finalResult.score
      );

      return;
    }

    setCurrentIndex(
      (index) => index + 1
    );
  }

  function restart() {
    attemptIdRef.current =
      createAttemptId();

    setAnswers({});
    setCompleted(false);
    setStarted(true);
    setCurrentIndex(0);

    try {
      window.localStorage.removeItem(
        STORAGE_KEY
      );
    } catch {
      // Ignore unavailable storage.
    }
  }

  if (!started) {
    return (
      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#0e1b29] shadow-[0_35px_90px_-50px_rgba(0,0,0,0.75)]">
        <div className="grid gap-8 p-7 md:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8ca667]/30 bg-[#8ca667]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b9c9a4]">
              <ClipboardCheck
                size={14}
                aria-hidden
              />
              Free Home Tech Health Check
            </div>

            <h2 className="mt-5 max-w-2xl font-serif text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-[#f4f0e8] md:text-5xl">
              How healthy is your home technology?
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-[#c8c5be] md:text-lg">
              Find the weak spots in your devices,
              warranties, network, documents, backups,
              and technology security in about one minute.
            </p>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#dcd7ce]">
              {[
                "10 quick questions",
                "No account required",
                "Instant personalized score",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2"
                >
                  <CheckCircle2
                    size={16}
                    className="text-[#8ca667]"
                    aria-hidden
                  />
                  {item}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setStarted(true)
              }
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#718d4f] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#7f995b] focus:outline-none focus:ring-2 focus:ring-[#b9c9a4] focus:ring-offset-2 focus:ring-offset-[#0e1b29]"
            >
              Check My Home Tech Health
              <ArrowRight
                size={16}
                aria-hidden
              />
            </button>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-6 md:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ca667]">
              Your report includes
            </p>

            <div className="mt-5 space-y-4">
              {[
                {
                  icon: ShieldCheck,
                  title:
                    "0–100 Home Tech Health Score",
                  text:
                    "A simple snapshot of how prepared and organized your home technology is.",
                },
                {
                  icon: Sparkles,
                  title:
                    "Four category scores",
                  text:
                    "Devices, protection, network security, and recovery readiness.",
                },
                {
                  icon: ClipboardCheck,
                  title:
                    "Three next steps",
                  text:
                    "Personalized recommendations based on the gaps you identify.",
                },
              ].map(
                ({
                  icon: Icon,
                  title,
                  text,
                }) => (
                  <div
                    key={title}
                    className="flex gap-4 rounded-2xl border border-white/8 bg-[#132536]/70 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8ca667]/12 text-[#a9bc90]">
                      <Icon
                        size={19}
                        aria-hidden
                      />
                    </div>

                    <div>
                      <p className="font-medium text-[#f4f0e8]">
                        {title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#aba9a4]">
                        {text}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#0e1b29] shadow-[0_35px_90px_-50px_rgba(0,0,0,0.75)]">
        <div className="p-7 md:p-10 lg:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8ca667]">
                Your Home Tech Health Score
              </p>

              <h2 className="mt-4 font-serif text-4xl font-medium tracking-[-0.035em] text-[#f4f0e8] md:text-5xl">
                {result.status}
              </h2>

              <p className="mt-4 text-base leading-7 text-[#c8c5be]">
                {result.summary}
              </p>
            </div>

            <HealthScoreRing
              score={result.score}
            />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {result.categories.map(
              (category) => (
                <div
                  key={
                    category.category
                  }
                  className="rounded-[22px] border border-white/10 bg-[#132536] p-5"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9faaa8]">
                    {category.label}
                  </p>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <p className="font-serif text-3xl font-medium text-[#f4f0e8]">
                      {category.score}
                      <span className="text-base text-[#8a928f]">
                        /100
                      </span>
                    </p>

                    <span className="text-xs font-semibold text-[#a9bc90]">
                      {category.status}
                    </span>
                  </div>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-[#8ca667]"
                      style={{
                        width: `${category.score}%`,
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="rounded-[24px] border border-white/10 bg-[#132536] p-6 md:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8ca667]">
                Your next 3 steps
              </p>

              <ol className="mt-5 space-y-4">
                {result.recommendations.map(
                  (
                    recommendation,
                    index
                  ) => (
                    <li
                      key={
                        recommendation
                      }
                      className="flex gap-4"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#8ca667]/30 bg-[#8ca667]/10 text-sm font-semibold text-[#b9c9a4]">
                        {index + 1}
                      </span>

                      <p className="pt-1 text-sm leading-6 text-[#ddd8cf]">
                        {
                          recommendation
                        }
                      </p>
                    </li>
                  )
                )}
              </ol>
            </div>

            <div className="rounded-[24px] border border-[#8ca667]/25 bg-[#8ca667]/10 p-6 md:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b9c9a4]">
                Turn your score into action
              </p>

              <h3 className="mt-3 font-serif text-2xl font-medium tracking-[-0.02em] text-[#f4f0e8]">
                Build the home record your health check is missing.
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#c8c5be]">
                Home Tech Vault keeps your devices,
                receipts, warranties, manuals, network
                information, and maintenance records in
                one dependable place.
              </p>

              <Link
                href="/signup?source=health-check"
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#718d4f] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#7f995b] focus:outline-none focus:ring-2 focus:ring-[#b9c9a4]"
              >
                Create My Free Vault
                <ArrowRight
                  size={16}
                  aria-hidden
                />
              </Link>

              <button
                type="button"
                onClick={restart}
                className="mt-4 flex items-center gap-2 text-sm font-medium text-[#b9b6af] transition hover:text-[#f4f0e8]"
              >
                <RotateCcw
                  size={15}
                  aria-hidden
                />
                Retake health check
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  const selectedValue =
    answers[question.id];

  return (
    <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#0e1b29] shadow-[0_35px_90px_-50px_rgba(0,0,0,0.75)]">
      <div className="p-7 md:p-10 lg:p-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8ca667]">
              Home Tech Health Check
            </p>
            <p className="mt-1 text-sm text-[#aaa7a0]">
              Question{" "}
              {currentIndex + 1} of{" "}
              {
                HEALTH_CHECK_QUESTIONS.length
              }
            </p>
          </div>

          <span className="text-sm font-semibold text-[#d8d3ca]">
            {progress}% complete
          </span>
        </div>

        <div
          className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/8"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Health Check progress"
        >
          <div
            className="h-full rounded-full bg-[#8ca667] transition-[width] duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="mx-auto max-w-3xl py-10 md:py-14">
          <h2 className="font-serif text-3xl font-medium leading-tight tracking-[-0.03em] text-[#f4f0e8] md:text-4xl">
            {question.question}
          </h2>

          {question.description ? (
            <p className="mt-4 text-base leading-7 text-[#aaa7a0]">
              {question.description}
            </p>
          ) : null}

          <div
            className="mt-8 grid gap-3 sm:grid-cols-3"
            role="group"
            aria-label="Choose an answer"
          >
            {HEALTH_CHECK_OPTIONS.map(
              (option) => {
                const selected =
                  selectedValue ===
                  option.value;

                return (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    onClick={() =>
                      chooseAnswer(
                        question.id,
                        option.value
                      )
                    }
                    aria-pressed={
                      selected
                    }
                    className={
                      selected
                        ? "min-h-14 rounded-2xl border border-[#8ca667] bg-[#8ca667]/15 px-5 py-4 text-base font-semibold text-[#f4f0e8] outline-none transition focus:ring-2 focus:ring-[#b9c9a4]"
                        : "min-h-14 rounded-2xl border border-white/10 bg-[#132536] px-5 py-4 text-base font-semibold text-[#e8e3da] outline-none transition hover:border-[#8ca667]/50 hover:bg-[#192b3e] focus:ring-2 focus:ring-[#b9c9a4]"
                    }
                  >
                    {option.label}
                  </button>
                );
              }
            )}
          </div>

          <div className="mt-7 flex items-center justify-between">
            <button
              type="button"
              disabled={
                currentIndex === 0
              }
              onClick={() =>
                setCurrentIndex(
                  (index) =>
                    Math.max(
                      0,
                      index - 1
                    )
                )
              }
              className="inline-flex items-center gap-2 text-sm font-medium text-[#aaa7a0] transition hover:text-[#f4f0e8] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft
                size={16}
                aria-hidden
              />
              Previous
            </button>

            <p className="text-xs text-[#777f7c]">
              Your answers stay in this browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
