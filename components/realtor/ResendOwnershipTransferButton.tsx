"use client";

import {
  useState,
} from "react";

import {
  Check,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

export default function ResendOwnershipTransferButton({
  giftId,
  buyerEmail,
}: {
  giftId: string;
  buyerEmail: string;
}) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    success,
    setSuccess,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  async function resend() {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response =
        await fetch(
          `/api/realtor/gifts/${giftId}/send-transfer`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                realtorAccessAfterTransfer:
                  "remove",
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to resend ownership email."
        );
      }

      setSuccess(true);

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to resend ownership email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5">
      {error ? (
        <div className="mb-3 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-100">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-3 flex items-center gap-2 rounded-2xl bg-[#718d4f]/20 px-4 py-3 text-xs text-[#dce8cf]">
          <Check size={14} />
          New ownership email sent.
        </div>
      ) : null}

      <button
        type="button"
        onClick={resend}
        disabled={loading}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2
              size={15}
              className="animate-spin"
            />
            Resending...
          </>
        ) : (
          <>
            <RefreshCw size={15} />
            Resend Ownership Email
          </>
        )}
      </button>

      <p className="mt-3 text-center text-[10px] leading-5 text-white/40">
        Sends a fresh secure claim link to{" "}
        {buyerEmail}
      </p>
    </div>
  );
}
