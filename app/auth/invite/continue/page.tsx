"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/ui/Button";
import { brand } from "@/lib/design-system/tokens";

const continueBenefits = [
  "Verify your invitation securely",
  "Set your password and create your vault",
  "Finish setup on this device",
] as const;

export default function InviteContinuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [errorMessage, setErrorMessage] =
    useState("");
  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    if (!token) {
      setErrorMessage(
        "This invitation link is incomplete. Open the newest invitation email again."
      );
    }
  }, [token]);

  async function handleContinue(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!token) {
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      const response = await fetch(
        "/api/auth/invite/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );

      const payload =
        (await response.json()) as {
          redirectUrl?: string;
          error?: string;
        };

      if (!response.ok || !payload.redirectUrl) {
        throw new Error(
          payload.error ||
            "Unable to continue invitation setup."
        );
      }

      router.replace(payload.redirectUrl);
    } catch (error) {
      console.error(
        "Invite continue error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to continue invitation setup."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      headline={brand.identity}
      description="Continue setting up the Home Tech Vault account you were invited to create."
      benefits={[...continueBenefits]}
    >
      <AuthCard
        title="Continue your invitation"
        description="Select continue to verify your invitation and set your password."
      >
        {errorMessage ? (
          <p className="mb-4 rounded-[var(--radius-card)] border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            {errorMessage}
          </p>
        ) : null}

        <form
          onSubmit={handleContinue}
          className="space-y-4"
        >
          <Button
            type="submit"
            disabled={!token || submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Preparing secure link…
              </>
            ) : (
              "Continue setup"
            )}
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center text-sm text-text-secondary">
          <Link
            href="/login"
            className="hover:text-text-primary"
          >
            Already finished setup? Sign in
          </Link>
          <Link
            href="/contact"
            className="hover:text-text-primary"
          >
            Contact support
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
