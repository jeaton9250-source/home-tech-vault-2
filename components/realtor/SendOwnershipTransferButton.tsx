"use client";

import {
  useState,
} from "react";

import {
  ArrowRight,
  Check,
  Loader2,
  Mail,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

export default function SendOwnershipTransferButton({
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
    sent,
    setSent,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  async function sendTransfer() {
    setLoading(true);
    setError(null);

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
            "Unable to send ownership transfer."
        );
      }

      setSent(true);

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send ownership transfer."
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-[#c9d8b9] bg-[#eef4e8] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#718d4f] text-white">
            <Check size={15} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#183047]">
              Ownership transfer sent
            </p>

            <p className="mt-1 text-xs text-[#718078]">
              Claim link emailed to{" "}
              {buyerEmail}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error ? (
        <div className="mb-4 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-100">
          {error}
        </div>
      ) : null}

      <button
        type="button"
        onClick={sendTransfer}
        disabled={loading}
        className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[#718d4f] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#617c43] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2
              size={16}
              className="animate-spin"
            />

            Sending ownership...
          </>
        ) : (
          <>
            <Mail size={16} />

            Send Ownership to Buyer

            <ArrowRight size={15} />
          </>
        )}
      </button>

      <p className="mt-3 text-center text-[10px] leading-5 text-white/40">
        Sends a secure claim link to{" "}
        {buyerEmail}
      </p>
    </div>
  );
}
