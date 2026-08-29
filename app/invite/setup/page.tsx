"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import AuthAlert from "@/components/auth/AuthAlert";
import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import {
  INVITATION_TYPE_JOIN_HOUSEHOLD,
  normalizeInvitationType,
} from "@/lib/admin/invitationTypes";
import {
  readInviteUserMetadata,
  resolveCreateAccountInvitePath,
  userHasHouseholdMembership,
} from "@/lib/auth/inviteOnboarding";
import { brand } from "@/lib/design-system/tokens";
import { supabase } from "@/lib/supabase";

const setupBenefits = [
  "Create your own independent Home Tech Vault",
  "Organize devices, documents, and warranties securely",
  "Stay separate from the administrator who invited you",
] as const;

const SESSION_BOOTSTRAP_MS = 4000;

export default function CreateAccountInviteSetupPage() {
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(true);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [
    isRealtorInvite,
    setIsRealtorInvite,
  ] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    let resolved = false;

    async function bootstrapFromUser(
      user: NonNullable<
        Awaited<
          ReturnType<typeof supabase.auth.getUser>
        >["data"]["user"]
      >
    ) {
      const metadata = readInviteUserMetadata(user);

      console.info("Invite setup session", {
        hasUser: true,
        email: user.email ?? null,
        invitationType: metadata.invitationType,
        onboardingMode: metadata.onboardingMode,
        passwordSetupCompleted:
          metadata.passwordSetupCompleted,
      });

      const rawMetadata =
        (user.user_metadata ??
          {}) as Record<
          string,
          unknown
        >;

      const realtorInvite =
        rawMetadata.account_role ===
          "realtor" ||
        rawMetadata.onboarding_mode ===
          "realtor";

      if (realtorInvite) {
        resolved = true;

        setIsRealtorInvite(
          true
        );

        setInviteEmail(
          user.email ?? ""
        );

        setFirstName(
          typeof rawMetadata.first_name ===
            "string"
            ? rawMetadata.first_name
            : ""
        );

        setLastName(
          typeof rawMetadata.last_name ===
            "string"
            ? rawMetadata.last_name
            : ""
        );

        setSessionReady(
          true
        );

        setCheckingSession(
          false
        );

        return;
      }

      if (
        metadata.invitationType ===
        INVITATION_TYPE_JOIN_HOUSEHOLD
      ) {
        const token =
          typeof user.user_metadata?.invitation_token ===
          "string"
            ? user.user_metadata.invitation_token
            : "";

        if (token) {
          router.replace(
            `/family/accept/${encodeURIComponent(token)}`
          );
          return;
        }
      }

      const hasHousehold =
        await userHasHouseholdMembership(user.id);

      const nextPath = resolveCreateAccountInvitePath({
        user,
        hasHousehold,
      });

      if (
        nextPath &&
        nextPath !== "/invite/setup"
      ) {
        router.replace(nextPath);
        return;
      }

      if (!mounted) {
        return;
      }

      resolved = true;
      setInviteEmail(user.email ?? "");
      setSessionReady(true);
      setCheckingSession(false);
    }

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (user) {
        await bootstrapFromUser(user);
      }
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted || resolved || !session?.user) {
          return;
        }

        await bootstrapFromUser(session.user);
      }
    );

    const timeout = window.setTimeout(() => {
      if (!mounted || resolved) {
        return;
      }

      resolved = true;
      setCheckingSession(false);
    }, SESSION_BOOTSTRAP_MS);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [router]);

  useEffect(() => {
    if (
      !sessionReady ||
      isRealtorInvite
    ) {
      return;
    }

    let cancelled = false;

    async function loadInvitation() {
      try {
        setLoadingInvite(true);
        setErrorMessage("");

        const response = await fetch(
          "/api/invite/create-account/session",
          { cache: "no-store" }
        );
        const payload = (await response.json()) as {
          invitation?: {
            email: string;
            firstName: string | null;
            lastName: string | null;
            invitationType?: string | null;
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
            payload.error ||
              "Unable to load this invitation."
          );
        }

        if (cancelled || !payload.invitation) {
          return;
        }

        const invitationType = normalizeInvitationType(
          payload.invitation.invitationType
        );

        if (
          invitationType ===
          INVITATION_TYPE_JOIN_HOUSEHOLD
        ) {
          router.replace("/set-password");
          return;
        }

        setInviteEmail(payload.invitation.email);
        setFirstName(
          payload.invitation.firstName?.trim() || ""
        );
        setLastName(
          payload.invitation.lastName?.trim() || ""
        );
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
  }, [
    sessionReady,
    isRealtorInvite,
    router,
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!sessionReady) {
      setErrorMessage(
        "Your invitation session is missing or has expired."
      );
      return;
    }

    if (!firstName.trim()) {
      setErrorMessage("Enter your first name.");
      return;
    }

    if (!lastName.trim()) {
      setErrorMessage("Enter your last name.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Your password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      const { data, error: passwordError } =
        await supabase.auth.updateUser({
          password,
          data: isRealtorInvite
            ? {
                first_name:
                  firstName.trim(),
                last_name:
                  lastName.trim(),
                full_name:
                  fullName,
                account_role:
                  "realtor",
                onboarding_mode:
                  "realtor",
                platform_access:
                  "realtor",
                password_setup_completed:
                  true,
              }
            : {
                first_name:
                  firstName.trim(),
                last_name:
                  lastName.trim(),
                full_name:
                  fullName,
                onboarding_mode:
                  "create_household",
                invitation_type:
                  "create_account",
                password_setup_completed:
                  true,
              },
        });

      console.info("Invite password update", {
        success: !passwordError,
        userId: data.user?.id ?? null,
      });

      if (passwordError) {
        throw passwordError;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setErrorMessage(
          "Your password was saved, but your session could not be continued. Please sign in with your new password."
        );
        router.replace("/login?setup=complete");
        return;
      }

      if (isRealtorInvite) {
        const response =
          await fetch(
            "/api/invite/realtor/accept",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body:
                JSON.stringify({
                  firstName:
                    firstName.trim(),
                  lastName:
                    lastName.trim(),
                }),
            }
          );

        const payload =
          (await response.json()) as {
            success?: boolean;
            redirectTo?: string;
            error?: string;
          };

        if (
          !response.ok ||
          !payload.success
        ) {
          throw new Error(
            payload.error ||
              "Unable to activate your Realtor account."
          );
        }

        window.location.assign(
          payload.redirectTo ||
            "/realtor"
        );

        return;
      }

      router.replace(
        "/onboarding/create-household"
      );
      router.refresh();
    } catch (error) {
      console.error("Create-account setup error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save your account details."
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
          Verifying your invitation…
        </div>
      </main>
    );
  }

  if (!sessionReady) {
    return (
      <AuthLayout
        headline={brand.identity}
        description="Create the Home Tech Vault account you were invited to set up."
        benefits={[...setupBenefits]}
      >
        <AuthCard
          overline="Account invitation"
          title="Invitation session expired"
          description="Your invitation session is missing or has expired. Open the secure link from your invitation email to set your password."
        >
          {errorMessage ? (
            <AuthAlert variant="error">{errorMessage}</AuthAlert>
          ) : null}

          <div className="mt-6 flex flex-col gap-3">
            <Button href="/login" variant="secondary">
              Go to sign in
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
      headline="Create your Home Tech Vault"
      description="Set your password and confirm your name to continue."
      benefits={[...setupBenefits]}
    >
      <AuthCard
        overline="Account invitation"
        title="Create your Home Tech Vault"
        description={
          inviteEmail
            ? `Finish setup for ${inviteEmail}.`
            : "Finish setup for your Home Tech Vault invitation."
        }
      >
        {errorMessage ? (
          <AuthAlert variant="error">{errorMessage}</AuthAlert>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <FormInput
            id="invite-email"
            label="Email address"
            value={inviteEmail}
            readOnly
            disabled
            autoComplete="email"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              id="invite-first-name"
              label="First name"
              value={firstName}
              onChange={(event) =>
                setFirstName(event.target.value)
              }
              autoComplete="given-name"
              required
            />
            <FormInput
              id="invite-last-name"
              label="Last name"
              value={lastName}
              onChange={(event) =>
                setLastName(event.target.value)
              }
              autoComplete="family-name"
              required
            />
          </div>

          <PasswordInput
            id="invite-password"
            label="New password"
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

          <p className="text-xs leading-5 text-text-tertiary">
            Passwords must be at least 8 characters and match.
            You are setting your password for the first time —
            do not use the sign-in page until setup is complete.
          </p>

          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving password…
              </>
            ) : (
              "Set Password and Continue"
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-text-muted">
          Already finished setup?{" "}
          <Link
            href="/login?setup=complete"
            className="font-medium text-interaction underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
