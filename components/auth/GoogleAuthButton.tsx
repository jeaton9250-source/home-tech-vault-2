"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { clearDemoModeStorage } from "@/lib/demo/demoModeStorage";

type GoogleAuthButtonProps = {
  nextPath?: string;
  label?: string;
};

export default function GoogleAuthButton({
  nextPath = "/dashboard",
  label = "Continue with Google",
}: GoogleAuthButtonProps) {
  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  async function continueWithGoogle() {
    setErrorMessage("");
    setLoading(true);

    try {
      clearDemoModeStorage();

      const callbackUrl = new URL(
        "/auth/callback",
        window.location.origin
      );

      callbackUrl.searchParams.set(
        "next",
        nextPath
      );

      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo:
              callbackUrl.toString(),
            queryParams: {
              prompt: "select_account",
            },
          },
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(
        "Google authentication error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to continue with Google."
      );

      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={continueWithGoogle}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border-subtle bg-white px-5 py-3.5 text-sm font-semibold text-text-primary shadow-sm transition hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2
            size={19}
            className="animate-spin"
          />
        ) : (
          <GoogleIcon />
        )}

        {loading
          ? "Opening Google..."
          : label}
      </button>

      {errorMessage ? (
        <p className="mt-3 text-center text-sm text-red-600">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.19-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.32 2.98-7.38Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.89 6.64-2.4l-3.24-2.5c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.93A6 6 0 0 1 6.07 12c0-.67.12-1.32.32-1.93v-2.6H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.53l3.35-2.6Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.94c1.47 0 2.79.5 3.82 1.5l2.87-2.87C16.97 2.97 14.7 2 12 2a10 10 0 0 0-8.96 5.47l3.35 2.6C7.18 7.7 9.39 5.94 12 5.94Z"
      />
    </svg>
  );
}
