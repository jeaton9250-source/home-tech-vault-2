"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Home,
  Loader2,
  LogOut,
} from "lucide-react";

type State = {
  active: boolean;
  label?: string;
};

export default function RealtorClientVaultBanner() {
  const [state, setState] =
    useState<State | null>(
      null
    );

  const [exiting, setExiting] =
    useState(false);

  useEffect(() => {
    void fetch(
      "/api/realtor/vault-mode/status",
      {
        cache: "no-store",
      }
    )
      .then((response) =>
        response.json()
      )
      .then((payload) => {
        setState(payload);
      })
      .catch(() => {
        setState({
          active: false,
        });
      });
  }, []);

  if (!state?.active) {
    return null;
  }

  async function exit() {
    setExiting(true);

    const response =
      await fetch(
        "/api/realtor/vault-mode/exit",
        {
          method: "POST",
        }
      );

    const payload =
      (await response.json()) as {
        redirectTo?: string;
      };

    /*
     * usePermissions stores its active household snapshot
     * in sessionStorage, not localStorage.
     *
     * Clear both stores so leaving Client Vault Mode can
     * never restore the Realtor property's household.
     */
    [
      window.sessionStorage,
      window.localStorage,
    ].forEach((storage) => {
      Object.keys(storage).forEach(
        (key) => {
          if (
            key.startsWith(
              "htv:permissions:"
            )
          ) {
            storage.removeItem(key);
          }
        }
      );
    });

    window.location.assign(
      payload.redirectTo ||
        "/realtor"
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-[1000] w-[calc(100%-2.5rem)] max-w-[440px] rounded-[20px] border border-[#718d4f]/35 bg-[#183047] p-4 text-[#f8f5ef] shadow-[0_22px_60px_-20px_rgba(11,22,35,0.85)]">
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#617c43]">
          <Home size={17} />
        </span>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c4d5ae]">
            Client Vault Mode
          </p>

          <p className="mt-1 truncate text-sm font-semibold">
            {state.label}
          </p>

          <p className="mt-1 text-xs leading-5 text-white/55">
            You are preparing this
            property&apos;s Home Tech
            Vault.
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={exiting}
        onClick={() => {
          void exit();
        }}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 text-sm font-semibold transition hover:bg-white/15 disabled:opacity-60"
      >
        {exiting ? (
          <Loader2
            size={15}
            className="animate-spin"
          />
        ) : (
          <LogOut size={15} />
        )}

        Exit Client Vault
      </button>
    </div>
  );
}
