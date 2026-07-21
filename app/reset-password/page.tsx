"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
} from "lucide-react";

import AuthAlert from "@/components/auth/AuthAlert";
import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import Button from "@/components/ui/Button";
import { brand } from "@/lib/design-system/tokens";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [recoveryReady, setRecoveryReady] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (error) {
          console.error(
            "Unable to read recovery session:",
            error
          );
        }

        if (session) {
          setRecoveryReady(true);
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) {
          return;
        }

        if (
          event === "PASSWORD_RECOVERY" ||
          Boolean(session)
        ) {
          setRecoveryReady(true);
          setErrorMessage("");
        }

        setCheckingSession(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleResetPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");

    if (!recoveryReady) {
      setErrorMessage(
        "This password reset link is invalid or has expired. Request a new reset email."
      );
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Your new password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "The passwords do not match."
      );
      return;
    }

    try {
      setSubmitting(true);

      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        throw error;
      }

      setSuccess(true);

      window.setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error(
        "Password update error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update your password."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-base px-6">
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2
            size={22}
            className="animate-spin"
            aria-hidden
          />
          Verifying your reset link...
        </div>
      </main>
    );
  }

  return (
    <AuthLayout
      headline={brand.identity}
      description="Choose a strong password to keep your household vault protected."
      benefits={[
        "Encrypted account credentials",
        "Household permissions stay intact",
        "Return to Home Pulse when finished",
      ]}
    >
      <AuthCard
        overline={
          success
            ? "Password updated"
            : recoveryReady
              ? "Secure password reset"
              : "Reset link unavailable"
        }
        title={
          success
            ? "Your new password is ready"
            : recoveryReady
              ? "Choose a new password"
              : "This reset link is invalid or expired"
        }
        description={
          success
            ? "Your password was updated successfully. Redirecting you to Home Pulse."
            : recoveryReady
              ? "Enter a new password for your Home Tech Vault account."
              : "Request a new password reset email and use the newest link you receive."
        }
      >
        {success ? (
          <AuthAlert variant="success">
            <div className="flex items-center gap-2">
              <Loader2
                size={16}
                className="animate-spin"
                aria-hidden
              />
              Opening Home Pulse...
            </div>
          </AuthAlert>
        ) : recoveryReady ? (
          <form
            onSubmit={handleResetPassword}
            className="space-y-5"
          >
            {errorMessage ? (
              <AuthAlert variant="error">
                {errorMessage}
              </AuthAlert>
            ) : null}

            <PasswordInput
                id="password"
                label="New password"
                value={password}
                onChange={setPassword}
                showPassword={showPassword}
                onToggleVisibility={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                autoComplete="new-password"
                placeholder="At least 8 characters"
                helperText="Use at least 8 characters."
              />

            <PasswordInput
                id="confirm-password"
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                showPassword={showPassword}
                onToggleVisibility={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                autoComplete="new-password"
                placeholder="Enter the password again"
              />

            <Button
              type="submit"
              disabled={submitting}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                    aria-hidden
                  />
                  Updating password...
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <Button
              href="/forgot-password"
              className="w-full"
            >
              Request another reset link
            </Button>

            <Button
              href="/login"
              variant="secondary"
              className="w-full"
            >
              Back to sign in
            </Button>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
