"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";

import Button from "@/components/ui/Button";

type ChatEntry = {
  role: "user" | "assistant";
  content: string;
};

type AskPayload = {
  answer?: string;
  error?: string;
};

type VaultSearchAssistantProps = {
  query: string;
  enabled: boolean;
  exactMatchCount?: number;
};

async function requestVaultAnswer({
  question,
  history,
  mode,
}: {
  question: string;
  history: ChatEntry[];
  mode: "search" | "chat";
}) {
  const response =
    await fetch(
      "/api/ai/ask",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            question,
            history,
            mode,
          }),
      }
    );

  const payload =
    (
      await response
        .json()
        .catch(() => ({}))
    ) as AskPayload;

  if (
    !response.ok ||
    !payload.answer?.trim()
  ) {
    throw new Error(
      payload.error ||
        "Vault Intelligence is temporarily unavailable."
    );
  }

  return payload.answer.trim();
}

export default function VaultSearchAssistant({
  query,
  enabled,
  exactMatchCount = 0,
}: VaultSearchAssistantProps) {
  const [messages, setMessages] =
    useState<ChatEntry[]>([]);

  const [followUp, setFollowUp] =
    useState("");

  const [
    showFollowUp,
    setShowFollowUp,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const requestedQueryRef =
    useRef("");

  const requestIdRef =
    useRef(0);

  const runInitialQuery =
    useCallback(
      async (
        question: string
      ) => {
        const normalized =
          question.trim();

        if (!normalized) {
          return;
        }

        const requestId =
          ++requestIdRef.current;

        /*
         * Keep the original question in
         * conversation history, but we do
         * not need to visually repeat it
         * because it already appears in
         * the main search bar.
         */
        setMessages([
          {
            role: "user",
            content: normalized,
          },
        ]);

        setFollowUp("");
        setShowFollowUp(false);
        setError("");
        setLoading(true);

        try {
          const answer =
            await requestVaultAnswer({
              question:
                normalized,

              history: [],

              mode: "search",
            });

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          setMessages([
            {
              role: "user",
              content:
                normalized,
            },
            {
              role:
                "assistant",
              content:
                answer,
            },
          ]);
        } catch (requestError) {
          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "Vault Intelligence is temporarily unavailable."
          );
        } finally {
          if (
            requestId ===
            requestIdRef.current
          ) {
            setLoading(false);
          }
        }
      },
      []
    );

  useEffect(() => {
    const normalized =
      query.trim();

    if (
      !enabled ||
      !normalized
    ) {
      requestedQueryRef.current =
        "";

      requestIdRef.current += 1;

      setMessages([]);
      setFollowUp("");
      setShowFollowUp(false);
      setError("");
      setLoading(false);

      return;
    }

    if (
      requestedQueryRef.current ===
      normalized
    ) {
      return;
    }

    requestedQueryRef.current =
      normalized;

    void runInitialQuery(
      normalized
    );
  }, [
    query,
    enabled,
    runInitialQuery,
  ]);

  async function handleFollowUp(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const question =
      followUp.trim();

    if (
      !question ||
      loading
    ) {
      return;
    }

    const history =
      messages
        .slice(-8)
        .map(
          (entry) => ({
            role:
              entry.role,
            content:
              entry.content,
          })
        );

    const requestId =
      ++requestIdRef.current;

    setMessages(
      (current) => [
        ...current,
        {
          role: "user",
          content: question,
        },
      ]
    );

    setFollowUp("");
    setError("");
    setLoading(true);

    try {
      const answer =
        await requestVaultAnswer({
          question,
          history,
          mode: "chat",
        });

      if (
        requestId !==
        requestIdRef.current
      ) {
        return;
      }

      setMessages(
        (current) => [
          ...current,
          {
            role:
              "assistant",
            content:
              answer,
          },
        ]
      );
    } catch (requestError) {
      if (
        requestId !==
        requestIdRef.current
      ) {
        return;
      }

      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Vault Intelligence is temporarily unavailable."
      );
    } finally {
      if (
        requestId ===
        requestIdRef.current
      ) {
        setLoading(false);
      }
    }
  }

  const normalizedQuery =
    query.trim();

  if (!normalizedQuery) {
    return null;
  }

  /*
   * Free search stays fully useful.
   * AI answer is a compact Pro upgrade
   * instead of another giant card.
   */
  if (!enabled) {
    return (
      <section
        className="
          flex
          flex-col
          gap-4
          rounded-[22px]
          border
          border-[#617c43]/15
          bg-[#f4f6ef]
          p-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#183047]
              text-[#9bb27a]
            "
          >
            <BrainCircuit
              size={18}
              aria-hidden
            />
          </div>

          <div>
            <p
              className="
                text-sm
                font-semibold
                text-[#17212a]
              "
            >
              Want a direct answer?
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-[#68737b]
              "
            >
              Vault Intelligence can
              explain your search in
              plain language.
            </p>
          </div>
        </div>

        <Button
          href="/upgrade"
          variant="secondary"
          size="sm"
        >
          <Sparkles
            size={14}
            aria-hidden
          />
          Unlock AI
        </Button>
      </section>
    );
  }

  const visibleMessages =
    messages.slice(1);

  const hasAnswer =
    visibleMessages.some(
      (entry) =>
        entry.role ===
        "assistant"
    );

  return (
    <section
      className="
        overflow-hidden
        rounded-[24px]
        border
        border-[#617c43]/15
        bg-[#fbfcf8]
        shadow-[0_18px_50px_-42px_rgba(11,22,35,0.55)]
      "
    >
      {/* Compact header */}
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          border-b
          border-[#182533]/8
          px-5
          py-4
          sm:px-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-[#183047]
              text-[#9bb27a]
            "
          >
            <BrainCircuit
              size={17}
              aria-hidden
            />
          </div>

          <div>
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <p
                className="
                  text-sm
                  font-semibold
                  text-[#17212a]
                "
              >
                Vault answer
              </p>

              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded-full
                  bg-[#edf2e8]
                  px-2
                  py-1
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-[#617c43]
                "
              >
                <Sparkles
                  size={9}
                  aria-hidden
                />
                AI
              </span>
            </div>

            <p
              className="
                mt-0.5
                text-[11px]
                text-[#818a90]
              "
            >
              Based on your saved
              Vault information
            </p>
          </div>
        </div>

        {error ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              requestedQueryRef.current =
                normalizedQuery;

              void runInitialQuery(
                normalizedQuery
              );
            }}
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              px-2.5
              py-2
              text-xs
              font-semibold
              text-[#617c43]
              hover:bg-[#edf2e8]
              disabled:opacity-50
            "
          >
            <RotateCcw
              size={12}
              aria-hidden
            />
            Retry
          </button>
        ) : null}
      </div>

      {/* Answer */}
      <div
        className="
          px-5
          py-5
          sm:px-6
        "
        aria-live="polite"
      >
        {loading &&
        !hasAnswer ? (
          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              text-[#68737b]
            "
          >
            <Loader2
              size={15}
              className="animate-spin"
              aria-hidden
            />

            Finding the simplest
            answer...
          </div>
        ) : null}

        {visibleMessages.map(
          (entry, index) => (
            <div
              key={`${entry.role}-${index}`}
              className={
                entry.role ===
                "user"
                  ? "mt-4 flex justify-end"
                  : index === 0
                    ? ""
                    : "mt-4"
              }
            >
              {entry.role ===
              "user" ? (
                <div
                  className="
                    max-w-[85%]
                    rounded-2xl
                    rounded-br-md
                    bg-[#183047]
                    px-4
                    py-2.5
                    text-sm
                    leading-6
                    text-white
                  "
                >
                  {entry.content}
                </div>
              ) : (
                <div
                  className="
                    whitespace-pre-line
                    text-[15px]
                    leading-7
                    text-[#35424b]
                  "
                >
                  {entry.content}
                </div>
              )}
            </div>
          )
        )}

        {loading &&
        hasAnswer ? (
          <div
            className="
              mt-4
              flex
              items-center
              gap-2
              text-xs
              text-[#7c868d]
            "
          >
            <Loader2
              size={13}
              className="animate-spin"
              aria-hidden
            />

            Thinking...
          </div>
        ) : null}

        {error ? (
          <div
            className="
              mt-3
              rounded-xl
              bg-amber-50
              px-3
              py-2.5
              text-xs
              leading-5
              text-amber-900
            "
          >
            {error}
          </div>
        ) : null}

        {hasAnswer ? (
          <div
            className="
              mt-5
              flex
              flex-wrap
              items-center
              justify-between
              gap-3
              border-t
              border-[#182533]/8
              pt-4
            "
          >
            <p
              className="
                text-[11px]
                text-[#8a9297]
              "
            >
              {exactMatchCount >
              0
                ? `${exactMatchCount} exact Vault ${
                    exactMatchCount ===
                    1
                      ? "record"
                      : "records"
                  } found below.`
                : "No exact record match was needed — this answer used your broader Vault context."}
            </p>

            <button
              type="button"
              onClick={() =>
                setShowFollowUp(
                  (current) =>
                    !current
                )
              }
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                px-2.5
                py-2
                text-xs
                font-semibold
                text-[#617c43]
                transition
                hover:bg-[#edf2e8]
              "
            >
              Ask a follow-up

              {showFollowUp ? (
                <ChevronUp
                  size={13}
                  aria-hidden
                />
              ) : (
                <ChevronDown
                  size={13}
                  aria-hidden
                />
              )}
            </button>
          </div>
        ) : null}
      </div>

      {/* Follow-up stays hidden until wanted */}
      {showFollowUp &&
      hasAnswer ? (
        <form
          onSubmit={
            handleFollowUp
          }
          className="
            border-t
            border-[#182533]/8
            bg-white/70
            p-4
            sm:px-6
          "
        >
          <p
            className="
              mb-2
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.12em]
              text-[#7c868d]
            "
          >
            Follow-up
          </p>

          <div
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-[#182533]/10
              bg-white
              p-1.5
            "
          >
            <input
              value={followUp}
              onChange={(event) =>
                setFollowUp(
                  event.target.value
                )
              }
              disabled={loading}
              placeholder="What else do you want to know?"
              className="
                h-10
                min-w-0
                flex-1
                border-0
                bg-transparent
                px-3
                text-sm
                text-[#17212a]
                outline-none
                placeholder:text-[#9aa2a7]
              "
            />

            <button
              type="submit"
              disabled={
                loading ||
                !followUp.trim()
              }
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-[#183047]
                text-white
                transition
                hover:bg-[#162536]
                disabled:opacity-35
              "
              aria-label="Ask follow-up"
            >
              {loading ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                  aria-hidden
                />
              ) : (
                <Send
                  size={14}
                  aria-hidden
                />
              )}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
