"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-surface-sunken flex items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-xl border border-border-subtle">

        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-text-primary">
          Reset your password
        </h1>

        <p className="mt-3 text-text-secondary">
          Enter your email address and we'll send you a secure password reset link.
        </p>

        {sent ? (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">
            <CheckCircle2
              className="text-green-600"
              size={28}
            />

            <h2 className="mt-3 font-bold text-green-800">
              Check your inbox
            </h2>

            <p className="mt-2 text-sm text-green-700">
              If an account exists with that email,
              you'll receive a password reset link shortly.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Mail
                  size={16}
                  className="text-interaction"
                />
                Email Address
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-border-subtle px-4 py-3 outline-none focus:border-interaction"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full rounded-2xl bg-charcoal py-4 text-surface-card font-semibold hover:bg-charcoal-hover"
            >
              {loading ? (
                <span className="flex justify-center">
                  <Loader2 className="animate-spin" />
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}