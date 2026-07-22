"use client";

import { useState } from "react";

import {
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { usePermissions } from "@/hooks/usePermissions";

import {
  ReadOnlyRow,
  SettingsCard,
} from "@/components/account-settings/shared";

export default function SecurityTab() {
  const {
    user,
    isDemo,
  } = usePermissions();

  const [signingOut, setSigningOut] =
    useState(false);
  const [
    sendingReset,
    setSendingReset,
  ] = useState(false);
  const [resetSent, setResetSent] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  const email = user?.email || "";

  async function sendPasswordReset() {
    if (!email || isDemo) {
      return;
    }

    try {
      setSendingReset(true);
      setResetSent(false);
      setErrorMessage("");

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/reset-password`,
          }
        );

      if (error) {
        throw error;
      }

      setResetSent(true);
    } catch (error) {
      console.error(
        "Password reset error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send password reset email."
      );
    } finally {
      setSendingReset(false);
    }
  }

  async function signOut() {
    try {
      setSigningOut(true);

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      window.location.href = "/login";
    } catch (error) {
      console.error(
        "Unable to sign out:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign out."
      );
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="space-y-6">
      {errorMessage ? (
        <div className="rounded-[var(--radius-card)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <SettingsCard
        title="Password"
        description="Send a secure password reset link to your email address."
        footer={
          <button
            type="button"
            onClick={() => {
              void sendPasswordReset();
            }}
            disabled={
              sendingReset ||
              !email ||
              isDemo
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-charcoal px-6 text-sm font-semibold text-white transition hover:bg-charcoal-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sendingReset ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <KeyRound size={16} />
            )}
            {sendingReset
              ? "Sending..."
              : "Update Password"}
          </button>
        }
      >
        <ReadOnlyRow
          label="Sign-in email"
          value={email || "Not signed in"}
        />

        {resetSent ? (
          <p className="mt-4 text-sm text-emerald-700">
            Password reset email sent. Check your
            inbox to choose a new password.
          </p>
        ) : null}

        {isDemo ? (
          <p className="mt-4 text-sm text-text-secondary">
            Password changes are unavailable in demo
            mode.
          </p>
        ) : null}
      </SettingsCard>

      <SettingsCard
        title="Account protection"
        description="How your Home Tech Vault account is secured."
      >
        <div className="space-y-3">
          <ReadOnlyRow
            label="Authentication"
            value="Password protected"
          />

          <ReadOnlyRow
            label="Data access"
            value="Private to your account"
          />

          <ReadOnlyRow
            label="Two-factor authentication"
            value="Not configured"
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Session"
        description="Sign out of Home Tech Vault on this device."
      >
        <button
          type="button"
          onClick={() => {
            void signOut();
          }}
          disabled={signingOut || isDemo}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-5 text-sm font-semibold text-text-primary transition hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <LogOut size={16} />
          {signingOut
            ? "Signing out..."
            : "Sign Out"}
        </button>
      </SettingsCard>

      <section className="rounded-[var(--radius-card)] border border-red-200 bg-red-50/70 p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={20}
            className="mt-0.5 text-red-700"
          />

          <div>
            <h2 className="text-base font-semibold text-red-900">
              Need help with account access?
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-800">
              If you cannot access your account, use
              the password reset option above or contact
              support from the Help Center.
            </p>

            <a
              href="/contact"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-900 underline"
            >
              <Mail size={15} />
              Contact support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
