"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import {
  isCreateAccountInviteUser,
  loadIsPlatformAdmin,
  resolveAuthenticatedInviteDestination,
} from "@/lib/auth/inviteOnboarding";
import { resolveSafeAuthRedirect } from "@/lib/auth/safeRedirect";
import { brand } from "@/lib/design-system/tokens";
import { clearDemoModeStorage } from "@/lib/demo/demoModeStorage";
import { supabase } from "@/lib/supabase";
import { resolvePostAuthRedirect } from "@/lib/onboarding/redirect";
import { enforceActiveAccount } from "@/lib/auth/enforceActiveAccount";
import { useDemoMode } from "@/hooks/useDemoMode";

const loginBenefits = [
  "Review every device in one place",
  "Track warranty coverage and expirations",
  "Find important documents quickly",
] as const;

const INVITE_SESSION_CHECK_MS = 4000;

export default function LoginPage() {
  const router = useRouter();
  const { exitDemo } = useDemoMode();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [redirectPath] = useState(() => {
    if (typeof window === "undefined") {
      return "/dashboard";
    }

    return resolveSafeAuthRedirect(
      window.location.search,
      "/dashboard"
    );
  });

  useEffect(() => {
    clearDemoModeStorage();
    exitDemo();
  }, [exitDemo]);

  const [setupComplete] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      new URLSearchParams(window.location.search).get(
        "setup"
      ) === "complete"
    );
  });

  const isFamilyInvitation = redirectPath.startsWith(
    "/family/accept/"
  );

  const isLostInviteConfirmRedirect =
    redirectPath === "/auth/confirm";

  const isCreateAccountInvitation =
    redirectPath.startsWith("/invite/setup") ||
    redirectPath.startsWith("/onboarding/create-household");

  const isPendingCreateAccountInvite =
    isCreateAccountInvitation && !setupComplete;

  const [checkingInviteSession, setCheckingInviteSession] =
    useState(isPendingCreateAccountInvite);

  const [inviteSessionMissing, setInviteSessionMissing] =
    useState(false);

  useEffect(() => {
    if (!isPendingCreateAccountInvite) {
      return;
    }

    let mounted = true;
    let resolved = false;

    async function handleInviteUser(
      user: NonNullable<
        Awaited<
          ReturnType<typeof supabase.auth.getUser>
        >["data"]["user"]
      >
    ) {
      if (!isCreateAccountInviteUser(user)) {
        return false;
      }

      const isPlatformAdmin =
        await loadIsPlatformAdmin(user.id);

      const destination =
        await resolveAuthenticatedInviteDestination({
          user,
          requestedPath: redirectPath,
          isPlatformAdmin,
        });

      if (!destination) {
        return false;
      }

      resolved = true;
      router.replace(destination);
      return true;
    }

    async function checkInviteSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (user && (await handleInviteUser(user))) {
        return;
      }

      if (!mounted || resolved) {
        return;
      }

      resolved = true;
      setInviteSessionMissing(true);
      setCheckingInviteSession(false);
    }

    void checkInviteSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted || resolved || !session?.user) {
          return;
        }

        await handleInviteUser(session.user);
      }
    );

    const timeout = window.setTimeout(() => {
      if (!mounted || resolved) {
        return;
      }

      resolved = true;
      setInviteSessionMissing(true);
      setCheckingInviteSession(false);
    }, INVITE_SESSION_CHECK_MS);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [
    isPendingCreateAccountInvite,
    redirectPath,
    router,
  ]);

  useEffect(() => {
    if (isPendingCreateAccountInvite) {
      return;
    }

    let mounted = true;

    async function redirectAuthenticatedInvitee() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || !user) {
        return;
      }

      const isPlatformAdmin =
        await loadIsPlatformAdmin(user.id);

      const destination =
        await resolveAuthenticatedInviteDestination({
          user,
          requestedPath: redirectPath,
          isPlatformAdmin,
        });

      if (!destination) {
        return;
      }

      if (
        destination === redirectPath ||
        destination.startsWith("/invite/setup") ||
        destination.startsWith("/onboarding/create-household") ||
        destination.startsWith("/family/accept/")
      ) {
        router.replace(destination);
      }
    }

    void redirectAuthenticatedInvitee();

    return () => {
      mounted = false;
    };
  }, [
    isPendingCreateAccountInvite,
    redirectPath,
    router,
  ]);

  async function handleSignIn(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage("Enter your email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Enter your password.");
      return;
    }

    try {
      setSubmitting(true);

      clearDemoModeStorage();
      exitDemo();

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Your account could not be loaded.");
      }

      const accountCheck = await enforceActiveAccount(
        data.user.id
      );

      if (!accountCheck.ok) {
        setErrorMessage(accountCheck.message);
        return;
      }

      const isPlatformAdmin =
        await loadIsPlatformAdmin(data.user.id);

      const inviteDestination =
        await resolveAuthenticatedInviteDestination({
          user: data.user,
          requestedPath: redirectPath,
          isPlatformAdmin,
        });

      if (inviteDestination) {
        router.replace(inviteDestination);
        return;
      }

      const destination = await resolvePostAuthRedirect(
        supabase,
        data.user.id,
        redirectPath
      );

      router.replace(destination);
    } catch (error) {
      console.error("Sign-in error:", error);

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
      ? `/signup?redirect=${encodeURIComponent(redirectPath)}`
      : "/signup";

  const forgotPasswordHref =
    redirectPath !== "/dashboard"
      ? `/forgot-password?redirect=${encodeURIComponent(redirectPath)}`
      : "/forgot-password";

  const loginTitle = setupComplete
    ? "Sign in to continue setup"
    : isFamilyInvitation
      ? "Continue to your invitation"
      : isCreateAccountInvitation
        ? "Finish creating your vault"
        : "Welcome back";

  const loginDescription = setupComplete
    ? "Your password has been created. Sign in to continue setting up your vault."
    : isFamilyInvitation
      ? "Use the email address that received the household invitation. You will return to the invitation after signing in."
      : isCreateAccountInvitation
        ? "Continue setting up the Home Tech Vault account you were invited to create."
        : "Sign in to access your devices, warranties, documents, subscriptions, and household technology records.";

  if (isLostInviteConfirmRedirect) {
    return (
      <AuthLayout
        headline={brand.identity}
        description="Organize your devices, warranties, receipts, subscriptions, and important documents in one secure place."
        benefits={[...loginBenefits]}
        brandHref="/"
      >
        <AuthCard
          overline="Account invitation"
          title="Invitation link incomplete"
          description="This invitation link could not be completed because its secure token was lost. Please open a newly sent invitation email."
        >
          <Alert variant="warning" className="mb-5">
            Do not use this sign-in page to finish a new
            account invitation. The secure token is only included
            in the invitation email button link.
          </Alert>

          <div className="flex flex-col gap-3">
            <Button href="/contact" variant="secondary">
              Contact support
            </Button>
            <Button href="/login" variant="secondary">
              I already have an account
            </Button>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  if (checkingInviteSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-base px-6">
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2 size={22} className="animate-spin" />
          Verifying your invitation…
        </div>
      </main>
    );
  }

  if (inviteSessionMissing) {
    return (
      <AuthLayout
        headline={brand.identity}
        description="Organize your devices, warranties, receipts, subscriptions, and important documents in one secure place."
        benefits={[...loginBenefits]}
        brandHref="/"
      >
        <AuthCard
          overline="Account invitation"
          title="Invitation session expired"
          description="Your invitation session is missing or has expired. Open the secure link from your invitation email to set your password."
        >
          <Alert variant="warning" className="mb-5">
            This page is not where you create your password.
            Use the invitation link from your email, or sign in
            here only after you have finished password setup.
          </Alert>

          <div className="flex flex-col gap-3">
            <Button href="/login?setup=complete" variant="secondary">
              I already set my password
            </Button>
            <Button href="/contact" variant="secondary">
              Contact support
            </Button>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      headline={brand.identity}
      description="Organize your devices, warranties, receipts, subscriptions, and important documents in one secure place."
      benefits={[...loginBenefits]}
      brandHref="/"
    >
      <AuthCard
        overline={
          setupComplete
            ? "Account invitation"
            : isFamilyInvitation
              ? "Household invitation"
              : isCreateAccountInvitation
                ? "Account invitation"
                : "Welcome back"
        }
        title={loginTitle}
        description={loginDescription}
      >
        {setupComplete ? (
          <Alert variant="success" className="mb-5">
            Your password has been created. Sign in to continue
            setting up your vault.
          </Alert>
        ) : null}

        {isFamilyInvitation ? (
          <Alert
            variant="warning"
            title="Family invitation detected"
            className="mb-5"
          >
            You will return to the invitation automatically after
            signing in.
          </Alert>
        ) : null}

        <div
          aria-live="polite"
          aria-atomic="true"
          className="mb-5 empty:mb-0"
        >
          {errorMessage ? (
            <Alert variant="error">{errorMessage}</Alert>
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
            onChange={(event) => setEmail(event.target.value)}
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
              setShowPassword((current) => !current)
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
