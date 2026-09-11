"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { ArrowRight, Check, Gift, Home, KeyRound } from "lucide-react";

import PasswordInput from "@/components/auth/PasswordInput";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import { clearDemoModeStorage } from "@/lib/demo/demoModeStorage";

const giftDetails = [
  "A home record prepared for their address",
  "A personal welcome from their Realtor",
  "One year of Home Tech Vault Pro",
] as const;

const fieldStyle =
  "min-h-12 rounded-xl border-[#d8d2c7] bg-[#fffdf9] px-4 shadow-none focus-visible:border-[#77814e] focus-visible:ring-[#77814e]/15";

export default function RealtorSignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [brokerageName, setBrokerageName] = useState("");
  const [licenseState, setLicenseState] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    if (!cleanFirstName || !cleanLastName) {
      setErrorMessage("Enter your first and last name.");
      return;
    }

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Your password must be at least 8 characters.");
      return;
    }

    try {
      setSubmitting(true);
      clearDemoModeStorage();

      const response = await fetch("/api/realtor/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: cleanFirstName,
          lastName: cleanLastName,
          email: normalizedEmail,
          password,
          brokerageName: brokerageName.trim(),
          licenseState: licenseState.trim(),
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        sessionCreated?: boolean;
        requiresEmailConfirmation?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.error || "Unable to create your Realtor account.",
        );
      }

      if (payload.sessionCreated) {
        window.location.assign("/realtors/setup");
        return;
      }

      setSuccessMessage(
        "Check your email to confirm your Realtor account. After confirming, we'll help you prepare your first home gift.",
      );
    } catch (error) {
      console.error("[realtor-public-signup] failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create your Realtor account.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#152335]">
      <div className="mx-auto grid min-h-screen max-w-[1540px] lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative min-h-[460px] overflow-hidden lg:min-h-screen">
          <img
            src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=90"
            alt="A warm home ready to welcome its new owners"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#14263a]/80 via-[#14263a]/35 to-[#14263a]/85" />

          <div className="relative flex min-h-full flex-col px-6 py-7 text-white sm:px-10 sm:py-9 lg:min-h-screen lg:px-12 lg:py-11 xl:px-16">
            <Link
              href="/realtors"
              className="inline-flex w-fit items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <Home className="h-4 w-4 text-[#d4d779]" />
              </span>
              <span className="font-serif text-xl font-semibold leading-none tracking-[-0.025em]">
                Home Tech Vault
              </span>
            </Link>

            <div className="my-auto max-w-[620px] py-14 lg:py-20">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
                Home Tech Vault for Realtors
              </p>

              <h1 className="mt-6 font-serif text-[48px] leading-[0.98] tracking-[-0.05em] sm:text-[60px] lg:text-[68px]">
                Prepare a welcome
                <br />
                they will remember.
              </h1>

              <p className="mt-6 max-w-[540px] text-lg leading-8 text-white/70">
                Begin with your Realtor account. When your next buyer is ready,
                you can give them a home record made especially for their new
                address.
              </p>

              <div className="mt-9 hidden max-w-[500px] border-t border-white/15 pt-7 sm:block">
                {giftDetails.map((detail) => (
                  <p
                    key={detail}
                    className="mt-3 flex items-center gap-3 text-sm text-white/72 first:mt-0"
                  >
                    <Check className="h-4 w-4 shrink-0 text-[#d2d574]" />
                    {detail}
                  </p>
                ))}
              </div>
            </div>

            <div className="hidden max-w-[430px] border border-white/20 bg-[#faf7ef]/95 p-2 text-[#152335] shadow-[0_24px_70px_rgba(10,22,34,0.25)] backdrop-blur lg:block">
              <div className="border border-[#152335]/10 px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#818a84]">
                      Welcome home
                    </p>
                    <p className="mt-2 font-serif text-2xl tracking-[-0.03em]">
                      The Collins Home
                    </p>
                  </div>
                  <Gift className="h-5 w-5 text-[#7f8857]" />
                </div>

                <p className="mt-5 border-t border-[#152335]/10 pt-4 font-serif italic text-[#53606a]">
                  Prepared with care by your Realtor.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-12 sm:px-10 sm:py-16 lg:px-12 xl:px-16">
          <div className="w-full max-w-[620px]">
            <Link
              href="/realtors"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#738052] transition hover:text-[#556137]"
            >
              <span aria-hidden>←</span>
              For Realtors
            </Link>

            <div className="mt-10 border-b border-[#152335]/10 pb-8 sm:mt-12">
              <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7b865a]">
                <span className="h-px w-7 bg-[#9ba568]" />
                Your Realtor account
              </div>

              <h2 className="mt-5 font-serif text-[42px] leading-[1] tracking-[-0.045em] sm:text-[52px]">
                Begin your first
                <br />
                home gift.
              </h2>

              <p className="mt-5 max-w-[540px] leading-7 text-[#687586]">
                Tell us a little about you. You can add the buyer, address and
                personal details when you are ready to prepare a gift.
              </p>
            </div>

            <div aria-live="polite" className="mt-7 space-y-4 empty:mt-0">
              {errorMessage ? (
                <Alert variant="error">{errorMessage}</Alert>
              ) : null}

              {successMessage ? (
                <Alert variant="success" title="One more step">
                  {successMessage}
                </Alert>
              ) : null}
            </div>

            {!successMessage ? (
              <form onSubmit={handleSubmit} className="mt-8" noValidate>
                <fieldset className="space-y-5">
                  <legend className="sr-only">Your Realtor details</legend>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormInput
                      id="realtor-first-name"
                      label="First name"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      autoComplete="given-name"
                      inputClassName={fieldStyle}
                      required
                    />

                    <FormInput
                      id="realtor-last-name"
                      label="Last name"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      autoComplete="family-name"
                      inputClassName={fieldStyle}
                      required
                    />
                  </div>

                  <FormInput
                    id="realtor-email"
                    label="Business email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="you@brokerage.com"
                    inputClassName={fieldStyle}
                    required
                  />

                  <div className="grid gap-5 sm:grid-cols-[1fr_150px]">
                    <FormInput
                      id="realtor-brokerage"
                      label="Brokerage"
                      value={brokerageName}
                      onChange={(event) => setBrokerageName(event.target.value)}
                      autoComplete="organization"
                      placeholder="Optional"
                      inputClassName={fieldStyle}
                    />

                    <FormInput
                      id="realtor-license-state"
                      label="License state"
                      value={licenseState}
                      onChange={(event) => setLicenseState(event.target.value)}
                      placeholder="NC"
                      inputClassName={fieldStyle}
                      maxLength={40}
                    />
                  </div>

                  <PasswordInput
                    id="realtor-password"
                    label="Create a password"
                    value={password}
                    onChange={setPassword}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    helperText="Use at least 8 characters."
                    showPassword={showPassword}
                    inputClassName={fieldStyle}
                    onToggleVisibility={() =>
                      setShowPassword((current) => !current)
                    }
                    required
                  />
                </fieldset>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={submitting}
                  loadingLabel="Creating your Realtor account..."
                  className="mt-7 min-h-[54px] rounded-full"
                >
                  Create my Realtor account
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="mt-4 text-center text-xs leading-5 text-[#7b858c]">
                  By continuing, you agree to our{" "}
                  <Link
                    href="/terms"
                    className="font-medium text-[#617443] underline underline-offset-4"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-[#617443] underline underline-offset-4"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            ) : null}

            <div className="mt-8 flex flex-col gap-5 border-t border-[#152335]/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#687586]">
                Already have a Realtor account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#617443] underline decoration-[#a7ad75] underline-offset-4"
                >
                  Sign in
                </Link>
              </p>

              <p className="flex items-center gap-2 text-xs text-[#7b858c]">
                <KeyRound className="h-4 w-4 text-[#7b865a]" />
                Client homes stay separate
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
