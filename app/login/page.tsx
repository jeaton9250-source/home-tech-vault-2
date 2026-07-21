"use client";

import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import AuthAlert from "@/components/auth/AuthAlert";
import AuthCard from "@/components/auth/AuthCard";
import AuthFormField from "@/components/auth/AuthFormField";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import { authInputClassName } from "@/components/auth/authStyles";
import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { resolvePostAuthRedirect } from "@/lib/onboarding/redirect";
import { enforceActiveAccount } from "@/lib/auth/enforceActiveAccount";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    redirectPath,
  ] = useState(() => {
    if (typeof window === "undefined") {
      return "/dashboard";
    }

    const requestedRedirect =
      new URLSearchParams(
        window.location.search
      ).get("redirect");

    if (
      requestedRedirect &&
      requestedRedirect.startsWith("/") &&
      !requestedRedirect.startsWith("//")
    ) {
      return requestedRedirect;
    }

    return "/dashboard";
  });

  async function handleSignIn(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage(
        "Enter your email address."
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        "Enter your password."
      );
      return;
    }

    try {
      setSubmitting(true);

      window.localStorage.removeItem(
        "home-tech-vault-demo"
      );

      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword(
          {
            email: normalizedEmail,
            password,
          }
        );

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error(
          "Your account could not be loaded."
        );
      }

      const accountCheck =
        await enforceActiveAccount(
          data.user.id
        );

      if (!accountCheck.ok) {
        setErrorMessage(accountCheck.message);
        return;
      }

      const destination =
        await resolvePostAuthRedirect(
          supabase,
          data.user.id,
          redirectPath
        );

      router.replace(destination);

      router.refresh();
    } catch (error) {
      console.error(
        "Sign-in error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const signupHref =
    redirectPath !== "/dashboard"
      ? `/signup?redirect=${encodeURIComponent(
          redirectPath
        )}`
      : "/signup";

  const forgotPasswordHref =
    redirectPath !== "/dashboard"
      ? `/forgot-password?redirect=${encodeURIComponent(
          redirectPath
        )}`
      : "/forgot-password";

  const isFamilyInvitation =
    redirectPath.startsWith(
      "/family/accept/"
    );

  const loginTitle = isFamilyInvitation
    ? "Continue to your invitation"
    : "Welcome back";

  const loginDescription = isFamilyInvitation
    ? "Use the email address that received the household invitation. You will return to the invitation after signing in."
    : "Sign in to access your devices, warranties, documents, subscriptions, and household technology records.";

  return (
    <AuthLayout
      overline={
        isFamilyInvitation
          ? "Household invitation"
          : "Welcome back"
      }
      headline={
        isFamilyInvitation
          ? "Sign in to join your shared household."
          : "Your home technology, organized and protected."
      }
      description={
        isFamilyInvitation
          ? "After signing in, you will return to your invitation and be added to the shared Home Tech Vault household."
          : "Access warranties, receipts, network details, and maintenance records from one secure vault."
      }
      benefits={[
        "Review every device in one place",
        "Track warranty coverage",
        "Find important documents quickly",
        "Monitor your home technology health",
      ]}
      brandHref="/"
    >
      <AuthCard
        overline="Sign in"
        title={loginTitle}
        description={loginDescription}
      >
        {isFamilyInvitation ? (
          <AuthAlert
            variant="success"
            className="mb-5 border-warning/30 bg-warning-soft text-achievement"
          >
            <p className="font-medium">
              Family invitation detected
            </p>
            <p className="mt-1 text-text-secondary">
              You will return to the invitation
              automatically after signing in.
            </p>
          </AuthAlert>
        ) : null}

        {errorMessage ? (
          <AuthAlert
            variant="error"
            className="mb-5"
          >
            {errorMessage}
          </AuthAlert>
        ) : null}

        <form
          onSubmit={handleSignIn}
          className="space-y-5"
          noValidate
        >
          <AuthFormField
            label="Email address"
            htmlFor="login-email"
            icon={Mail}
          >
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              placeholder="you@example.com"
              required
              className={authInputClassName}
            />
          </AuthFormField>

          <AuthFormField
            label="Password"
            htmlFor="login-password"
            icon={LockKeyhole}
          >
            <PasswordInput
              id="login-password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              placeholder="Enter your password"
              showPassword={showPassword}
              onToggleVisibility={() =>
                setShowPassword(
                  (current) => !current
                )
              }
              required
            />
          </AuthFormField>

          <div className="flex items-center justify-end">
            <Link
              href={forgotPasswordHref}
              className="text-sm font-medium text-interaction underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                  aria-hidden
                />
                {isFamilyInvitation
                  ? "Returning to invitation..."
                  : "Signing in..."}
              </>
            ) : (
              <>
                <ShieldCheck
                  size={18}
                  aria-hidden
                />
                {isFamilyInvitation
                  ? "Sign in and accept invitation"
                  : "Sign in"}
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm leading-6 text-text-muted">
          New to Home Tech Vault?{" "}
          <Link
            href={signupHref}
            className="font-medium text-interaction underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
          >
            Create your vault
          </Link>
        </p>

        <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs leading-5 text-text-muted">
          <ShieldCheck
            size={14}
            className="shrink-0 text-interaction"
            aria-hidden
          />
          Your vault is protected with secure
          authentication.
        </p>

        <p className="mt-5 text-center text-sm text-text-muted">
          Want to look around first?{" "}
          <Link
            href="/demo"
            className="font-medium text-interaction underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
          >
            Open interactive demo
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
