"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Eye,
  Loader2,
  LogOut,
} from "lucide-react";

type ImpersonationState = {
  active: boolean;
  label?: string;
  expiresAt?: number;
};

export default function ImpersonationBanner() {
  const [state, setState] =
    useState<ImpersonationState | null>(
      null
    );

  const [exiting, setExiting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadState() {
      try {
        const response = await fetch(
          "/api/admin/impersonation/status",
          {
            cache: "no-store",
          }
        );

        const payload =
          (await response.json()) as ImpersonationState;

        if (!cancelled) {
          setState(payload);
        }
      } catch {
        if (!cancelled) {
          setState({
            active: false,
          });
        }
      }
    }

    void loadState();

    return () => {
      cancelled = true;
    };
  }, []);

  async function exitImpersonation() {
    setExiting(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/impersonation/exit",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      const payload =
        (await response.json()) as {
          ok?: boolean;
          error?: string;
          redirectTo?: string;
        };

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.error ||
            "Unable to exit impersonation."
        );
      }

      window.location.assign(
        payload.redirectTo ||
          "/admin/users"
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to exit impersonation."
      );

      setExiting(false);
    }
  }

  if (!state?.active) {
    return null;
  }

  const label =
    state.label?.trim() ||
    "this user";

  return (
    <div className="fixed bottom-4 left-4 z-[1000] w-[calc(100%-2rem)] max-w-[430px] overflow-hidden rounded-[18px] border border-[#718d4f]/35 bg-[#183047] text-[#f5f1e8] shadow-[0_18px_55px_-18px_rgba(11,22,35,0.75)] sm:bottom-6 sm:left-6">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#617c43]">
            <Eye size={16} />
          </span>

          <div className="min-w-0">
            <p className="text-sm font-semibold">
              Impersonating {label}
            </p>

            <p className="mt-0.5 text-xs leading-5 text-[#eee9df]/65">
              Viewing Home Tech Vault as this user.
              Changes affect their account.
            </p>

            {error ? (
              <p className="mt-1 text-xs font-medium text-red-300">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            void exitImpersonation();
          }}
          disabled={exiting}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-semibold text-[#f5f1e8] transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 sm:self-center"
        >
          {exiting ? (
            <Loader2
              size={15}
              className="animate-spin"
            />
          ) : (
            <LogOut size={15} />
          )}

          Exit impersonation
        </button>
      </div>
    </div>
  );
}
