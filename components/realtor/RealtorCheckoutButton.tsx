"use client";

import {
  useState,
} from "react";

import {
  ArrowRight,
  CreditCard,
  Loader2,
} from "lucide-react";

export default function RealtorCheckoutButton({
  giftId,
}: {
  giftId: string;
}) {
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

  async function checkout() {
    setLoading(true);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/realtor/gifts/${giftId}/checkout`,
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
            "Unable to start checkout."
        );
      }

      if (!data.checkoutUrl) {
        throw new Error(
          "Stripe did not return a checkout URL."
        );
      }

      window.location.href =
        data.checkoutUrl;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to start checkout."
      );

      setLoading(false);
    }
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
        onClick={checkout}
        disabled={loading}
        className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#718d4f] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#809d5a] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2
              size={16}
              className="animate-spin"
            />

            Opening Checkout...
          </>
        ) : (
          <>
            <CreditCard size={16} />

            Purchase Closing Gift

            <ArrowRight size={15} />
          </>
        )}
      </button>
    </div>
  );
}
