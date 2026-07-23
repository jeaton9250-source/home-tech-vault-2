"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";
import { Loader2 } from "lucide-react";

import AuthAlert from "@/components/auth/AuthAlert";
import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import { brand } from "@/lib/design-system/tokens";
import { supabase } from "@/lib/supabase";

const setupBenefits = [
  "Create your own independent household vault",
  "Invite family members when you are ready",
  "Keep your devices and documents private to your household",
] as const;

export default function NewAccountInviteSetupPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();

  const token =
    typeof params.token === "string" ? params.token : "";

  const [checkingSession, setCheckingSession] = useState(true);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function establishSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (session) {
          setSessionReady(true);
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    void establishSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      if (session) {
        setSessionReady(true);
        setErrorMessage("");
      }

      setCheckingSession(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionReady || !token) {
      return;
    }

    let cancelled = false;

    async function loadInvitation() {
      try {
        setLoadingInvite(true);
        setErrorMessage("");

        const response = await fetch(
          `/api/invite/new-account/${encodeURIComponent(token)}`
        );
        const payload = (await response.json()) as {
          invitation?: {
            email: string;
            firstName: string | null;
            lastName: string | null;
          };
          redirectTo?: string;
          error?: string;
        };

        if (!response.ok) {
          if (payload.redirectTo) {
            router.replace(payload.redirectTo);
            return;
          }

          throw new Error(
            payload.error || "Unable to load this invitation."
          );
        }

        if (cancelled || !payload.invitation) {
          return;
        }

        setInviteEmail(payload.invitation.email);
        setFirstName(payload.invitation.firstName?.trim() || "");
        setLastName(payload.invitation.lastName?.trim() || "");
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load this invitation."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingInvite(false);
        }
      }
    }

    void loadInvitation();

    return () => {
      cancelled = true;
    };
  }, [sessionReady, token, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!sessionReady) {
      setErrorMessage(
        "Open the invitation link from your email, or sign in with the invited address."
      );
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage("Enter your first and last name.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Your password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Your passwords do not match.");
      return;
    }

    if (!householdName.trim()) {
      setErrorMessage("Enter a household name.");
      return;
    }

    try {
      setSubmitting(true);

      const { error: passwordError } =
        await supabase.auth.updateUser({
          password,
          data: {
            full_name: `${firstName.trim()} ${lastName.trim()}`,
            household_name: householdName.trim(),
          },
        });

      if (passwordError) {
        throw passwordError;
      }

      const response = await fetch(
        "/api/invite/accept-new-account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            householdName: householdName.trim(),
          }),
        }
      );

      const payload = (await response.json()) as {
        message?: string;
        redirectTo?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error || "Unable to finish account setup."
        );
      }

      setSuccessMessage(
        payload.message || "Your household is ready."
      );

      window.setTimeout(() => {
        router.replace(payload.redirectTo || "/onboarding");
        router.refresh();
      }, 900);
    } catch (error) {
      console.error("New account setup error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to finish account setup."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingSession || (sessionReady && loadingInvite)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-base px-6">
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2 size={22} className="animate-spin" />
          Preparing your account setup…
        </div>
      </main>
    );
  }

  if (!sessionReady) {
    const returnPath = `/invite/setup/${encodeURIComponent(token)}`;

    return (
      <AuthLayout
        headline={brand.identity}
        description="Finish setting up the Home Tech Vault account you were invited to create."
        benefits={[...setupBenefits]}
      >
        <AuthCard
          overline="Account invitation"
          title="Sign in to continue"
          description="Open the invitation email link, or sign in with the invited email address to finish setup."
        >
          {errorMessage ? (
            <AuthAlert variant="error">{errorMessage}</AuthAlert>
          ) : null}

          <div className="mt-6 flex flex-col gap-3">
            <Button
              href={`/login?redirect=${encodeURIComponent(returnPath)}`}
            >
              Sign in to continue
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
      description="Create your password and name the household you will own."
      benefits={[...setupBenefits]}
    >
      <AuthCard
        overline="Account invitation"
        title="Set up your account"
        description={
          inviteEmail
            ? `Finish setup for ${inviteEmail}. You will own the household you create.`
            : "Finish setup for your Home Tech Vault invitation."
        }
      >
        <div
          aria-live="polite"
          aria-atomic="true"
          className="mb-5 space-y-4 empty:mb-0"
        >
          {errorMessage ? (
            <AuthAlert variant="error">{errorMessage}</AuthAlert>
          ) : null}
          {successMessage ? (
            <AuthAlert variant="success">{successMessage}</AuthAlert>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              id="invite-first-name"
              label="First name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="given-name"
              required
            />
            <FormInput
              id="invite-last-name"
              label="Last name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              autoComplete="family-name"
              required
            />
          </div>

          <PasswordInput
            id="invite-password"
            label="Password"
            value={password}
            onChange={setPassword}
            showPassword={showPassword}
            onToggleVisibility={() =>
              setShowPassword((current) => !current)
            }
            autoComplete="new-password"
            required
          />

          <PasswordInput
            id="invite-confirm-password"
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            showPassword={showConfirmPassword}
            onToggleVisibility={() =>
              setShowConfirmPassword((current) => !current)
            }
            autoComplete="new-password"
            required
          />

          <FormInput
            id="invite-household-name"
            label="Household name"
            value={householdName}
            onChange={(event) =>
              setHouseholdName(event.target.value)
            }
            placeholder="The Eaton Household"
            autoComplete="organization"
            required
          />

          <p className="text-xs leading-5 text-text-tertiary">
            Platform-admin access is not included. You can invite
            Admins, Members, and Viewers to your household later.
          </p>

          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating household…
              </>
            ) : (
              "Create my household"
            )}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
