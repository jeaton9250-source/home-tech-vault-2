"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  CheckCircle2,
  Home,
  Loader2,
  LockKeyhole,
  Monitor,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type ApprovalState =
  | "ready"
  | "approved"
  | "error";

function normalizePairingCode(
  value: string
) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function formatPairingCode(
  value: string
) {
  const normalized =
    normalizePairingCode(value);

  if (normalized.length <= 4) {
    return normalized;
  }

  return `${normalized.slice(
    0,
    4
  )}-${normalized.slice(4, 8)}`;
}

export default function AppleHomePairingApproval() {
  const searchParams =
    useSearchParams();

  const queryCode =
    searchParams.get("code") ?? "";

  const [
    pairingCode,
    setPairingCode,
  ] = useState(
    formatPairingCode(queryCode)
  );

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  const [
    signedIn,
    setSignedIn,
  ] = useState(false);

  const [
    approving,
    setApproving,
  ] = useState(false);

  const [
    approvalState,
    setApprovalState,
  ] =
    useState<ApprovalState>("ready");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  const normalizedCode =
    useMemo(
      () =>
        normalizePairingCode(
          pairingCode
        ),
      [pairingCode]
    );

  const returnPath =
    useMemo(() => {
      const formatted =
        formatPairingCode(
          normalizedCode
        );

      return formatted
        ? `/apple-home/pair?code=${encodeURIComponent(
            formatted
          )}`
        : "/apple-home/pair";
    }, [normalizedCode]);

  const loginHref =
    `/login?redirect=${encodeURIComponent(
      returnPath
    )}`;

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      setSignedIn(Boolean(user));
      setCheckingSession(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!mounted) {
            return;
          }

          setSignedIn(
            Boolean(session?.user)
          );

          setCheckingSession(false);
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function approveConnection() {
    setErrorMessage(null);
    setApprovalState("ready");

    if (
      normalizedCode.length !== 8
    ) {
      setApprovalState("error");
      setErrorMessage(
        "Enter the complete 8-character pairing code shown on your Mac."
      );
      return;
    }

    try {
      setApproving(true);

      const response =
        await fetch(
          "/api/apple-home/pair/approve",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              code: normalizedCode,
            }),
          }
        );

      const payload =
        (await response.json()) as {
          error?: string;
          status?: string;
          approvedAt?: string | null;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ??
            "The Apple Home connection could not be approved."
        );
      }

      setApprovalState("approved");
    } catch (error) {
      setApprovalState("error");

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The Apple Home connection could not be approved."
      );
    } finally {
      setApproving(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm">
          <Loader2
            size={18}
            className="animate-spin"
          />

          Checking your HomeCore account…
        </div>
      </main>
    );
  }

  if (
    approvalState === "approved"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
        <section className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 md:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 size={34} />
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              Connection approved
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Return to your Mac
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              HomeCore securely approved
              this Apple Home pairing
              request. The Mac connector
              should update automatically
              within a few seconds.
            </p>
          </div>

          <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex gap-3">
              <ShieldCheck
                size={21}
                className="mt-0.5 shrink-0 text-emerald-700"
              />

              <div>
                <p className="text-sm font-semibold text-emerald-950">
                  Secure Mac handoff complete
                </p>

                <p className="mt-1 text-sm leading-6 text-emerald-800">
                  Apple Home permission and
                  accessory selection will be
                  completed from the HomeCore
                  iPhone app in the next setup
                  stage.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Go to HomeCore
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 md:py-16">
      <section className="mx-auto w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="border-b border-slate-100 bg-slate-950 px-7 py-8 text-white md:px-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <Home size={25} />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
            Apple Home Integration
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Connect Apple Home
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            Approve the secure connection
            requested by your HomeCore Mac
            connector.
          </p>
        </div>

        <div className="p-7 md:p-10">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Monitor
                size={20}
                className="text-slate-700"
              />

              <p className="mt-3 text-sm font-semibold text-slate-950">
                Started on your Mac
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                This code was created by
                your paired HomeCore
                connector.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <LockKeyhole
                size={20}
                className="text-slate-700"
              />

              <p className="mt-3 text-sm font-semibold text-slate-950">
                One-time approval
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                The code expires and cannot
                be reused after approval.
              </p>
            </div>
          </div>

          <label className="mt-7 block">
            <span className="text-sm font-semibold text-slate-950">
              Pairing code
            </span>

            <input
              value={pairingCode}
              onChange={(event) => {
                setPairingCode(
                  formatPairingCode(
                    event.target.value
                  )
                );

                setErrorMessage(null);
                setApprovalState(
                  "ready"
                );
              }}
              maxLength={9}
              inputMode="text"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              placeholder="ABCD-EFGH"
              className="mt-2 min-h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-center text-xl font-bold uppercase tracking-[0.16em] text-slate-950 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
            />
          </label>

          {errorMessage ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
              {errorMessage}
            </div>
          ) : null}

          {!signedIn ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-950">
                Sign in required
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                Sign in to the HomeCore
                account that administers
                the household you are
                connecting.
              </p>

              <Link
                href={loginHref}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign in to continue
              </Link>
            </div>
          ) : (
            <button
              type="button"
              disabled={
                approving ||
                normalizedCode.length !==
                  8
              }
              onClick={() => {
                void approveConnection();
              }}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {approving ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Approving connection…
                </>
              ) : (
                <>
                  <ShieldCheck
                    size={17}
                  />

                  Approve Connection
                </>
              )}
            </button>
          )}

          <p className="mt-5 text-center text-xs leading-5 text-slate-500">
            Approving this request does
            not yet grant Apple Home
            access. Apple will display its
            own permission request later
            inside the HomeCore iPhone app.
          </p>
        </div>
      </section>
    </main>
  );
}
