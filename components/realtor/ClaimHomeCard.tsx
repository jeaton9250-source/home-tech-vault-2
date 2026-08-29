"use client";

import {
  useState,
} from "react";

import {
  Check,
  Loader2,
  LogIn,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

export default function ClaimHomeCard({
  token,
  signedIn,
}: {
  token: string;
  signedIn: boolean;
}) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  async function accept() {
    if (!signedIn) {
      router.push(
        `/login?next=${encodeURIComponent(
          `/claim-home/${token}`
        )}`
      );

      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/ownership-transfer/${token}/accept`,
          {
            method:
              "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to accept ownership."
        );
      }

      /*
       * Ownership acceptance can change the user's
       * household AND effective plan in the same request.
       *
       * Use a full navigation here instead of router.push()
       * so app-level permissions, household context, and
       * plan grants are reloaded from the server.
       */
      window.location.assign(
        data.redirectTo ||
          "/dashboard"
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to accept ownership."
      );

      setLoading(false);
    }
  }

  return (
    <div>
      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="button"
        onClick={accept}
        disabled={loading}
        className="inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-[#718d4f] px-6 text-sm font-semibold text-white transition hover:bg-[#617c43] disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2
              size={16}
              className="animate-spin"
            />
            Transferring ownership...
          </>
        ) : signedIn ? (
          <>
            <Check size={16} />
            Make This My Home Vault
          </>
        ) : (
          <>
            <LogIn size={16} />
            Sign In to Claim
          </>
        )}
      </button>
    </div>
  );
}
