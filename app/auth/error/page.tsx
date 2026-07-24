import Link from "next/link";

import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/ui/Button";

const REASON_MESSAGES: Record<string, string> = {
  missing_auth_code:
    "This sign-in link is incomplete. Ask your administrator to resend the invitation, then open the newest email. The secure link should start with https://www.hometechvault.com/auth/invite/continue.",
  auth_callback_failed:
    "We could not verify your invitation link. It may have expired, already been used, or been opened by an email scanner before you clicked it. Ask your administrator to resend the invitation, then use the newest email.",
  invalid_redirect:
    "This invitation link could not continue to the expected setup page.",
};

type AuthErrorPageProps = {
  searchParams: Promise<{
    reason?: string;
  }>;
};

export default async function AuthErrorPage({
  searchParams,
}: AuthErrorPageProps) {
  const params = await searchParams;
  const reason = params.reason?.trim() || "auth_callback_failed";
  const message =
    REASON_MESSAGES[reason] ??
    "Something went wrong while finishing your invitation setup.";

  return (
    <AuthLayout
      headline="Unable to continue setup"
      description="Your invitation link could not be completed."
      benefits={[
        "Request a fresh invitation from your administrator",
        "Open the newest email link on this device",
        "Contact support if the problem continues",
      ]}
    >
      <AuthCard
        title="Invitation setup error"
        description={message}
      >
        <div className="mt-6 flex flex-col gap-3">
          <Button href="/login">Go to sign in</Button>
          <Button href="/contact" variant="secondary">
            Contact support
          </Button>
          <Link
            href="/"
            className="text-center text-sm text-text-secondary hover:text-text-primary"
          >
            Return home
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
