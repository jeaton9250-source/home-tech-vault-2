"use client";

import { useState } from "react";
import {
  Eye,
  Loader2,
} from "lucide-react";

export default function EnterClientVaultButton({
  giftId,
}: {
  giftId: string;
}) {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function enter() {
    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          "/api/realtor/vault-mode/enter",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              giftId,
            }),
          }
        );

      const payload =
        (await response.json()) as {
          ok?: boolean;
          error?: string;
          redirectTo?: string;
        };

      if (
        !response.ok ||
        !payload.ok
      ) {
        throw new Error(
          payload.error ||
            "Unable to enter Client Vault."
        );
      }

      /*
       * usePermissions caches the current household in
       * sessionStorage. Clear both browser stores before
       * reloading so the Client Vault household is resolved
       * fresh from the server.
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
          "/dashboard"
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to enter Client Vault."
      );

      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          void enter();
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#183047] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#142b40] disabled:opacity-60"
      >
        {loading ? (
          <Loader2
            size={17}
            className="animate-spin"
          />
        ) : (
          <Eye size={17} />
        )}

        {loading
          ? "Opening Client Vault…"
          : "Enter Client Vault"}
      </button>

      {error ? (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
