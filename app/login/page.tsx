"use client";

import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import { brand } from "@/lib/design-system/tokens";
import { supabase } from "@/lib/supabase";
import { resolvePostAuthRedirect } from "@/lib/onboarding/redirect";
import { enforceActiveAccount } from "@/lib/auth/enforceActiveAccount";

const loginBenefits = [
  "Review every device in one place",
  "Track warranty coverage and expirations",
  "Find important documents quickly",
] as const;

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
      headline={brand.identity}
      description="Organize your devices, warranties, receipts, subscriptions, and important documents in one secure place."
      benefits={[...loginBenefits]}
      brandHref="/"
    >
      <AuthCard
        overline={
          isFamilyInvitation
            ? "Household invitation"
            : "Welcome back"
        }
        title={loginTitle}
        description={loginDescription}
      >
        {isFamilyInvitation ? (
          <Alert
            variant="warning"
            title="Family invitation detected"
            className="mb-5"
          >
            You will return to the invitation
            automatically after signing in.
          </Alert>
        ) : null}

        <div
          aria-live="polite"
          aria-atomic="true"
          className="mb-5 empty:mb-0"
        >
          {errorMessage ? (
            <Alert variant="error">
              {errorMessage}
            </Alert>
          ) : null}
        </div>

        <form
          onSubmit={handleSignIn}
          className="space-y-5"
          noValidate
        >
          <FormInput
            id="login-email"
            label="Email address"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            autoComplete="email"
            placeholder="you@example.com"
            required
          />

          <PasswordInput
            id="login-password"
            label="Password"
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
            loading={submitting}
            loadingLabel={
              isFamilyInvitation
                ? "Returning to invitation..."
                : "Signing in..."
            }
          >
            {isFamilyInvitation
              ? "Sign in and accept invitation"
              : "Sign In"}
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

        <p className="mt-5 text-center text-xs leading-5 text-text-muted">
          Protected with secure authentication.
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
