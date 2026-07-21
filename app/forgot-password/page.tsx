"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";

import AuthAlert from "@/components/auth/AuthAlert";
import AuthCard from "@/components/auth/AuthCard";
import AuthFormField from "@/components/auth/AuthFormField";
import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { brand } from "@/lib/design-system/tokens";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }

    setLoading(false);
  }

  return (
    <AuthLayout
      overline="Account recovery"
      headline={brand.identity}
      description="We'll send a secure link so you can choose a new password and get back into your vault."
      benefits={[
        "Secure, time-limited reset links",
        "Your household data stays protected",
        "Back to your vault in minutes",
      ]}
    >
      <AuthCard
        overline="Password reset"
        title="Reset your password"
        description="Enter the email address associated with your account."
      >
        {sent ? (
          <AuthAlert variant="success">
            <p className="font-medium">
              Check your inbox
            </p>
            <p className="mt-1">
              If an account exists with that email, you
              will receive a password reset link shortly.
            </p>
          </AuthAlert>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <AuthFormField
              label="Email address"
              htmlFor="email"
              icon={Mail}
            >
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                hasError={Boolean(error)}
              />
            </AuthFormField>

            {error ? (
              <AuthAlert variant="error">
                {error}
              </AuthAlert>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                    aria-hidden
                  />
                  Sending reset link...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-text-muted">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-interaction hover:text-interaction-hover"
          >
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
