"use client";

import {
  useEffect,
  useState,
  type ComponentType,
  type FormEvent,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  HelpCircle,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { usePermissions } from "@/hooks/usePermissions";
import { SUPPORT_CATEGORIES } from "@/lib/support/categories";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { SUPPORT_EMAIL } from "@/lib/marketing/trust";

import MarketingLayout, {
  MarketingContent,
  MarketingPageHero,
} from "@/components/marketing/MarketingLayout";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type FormState = {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  honeypot: string;
};

type SubmissionSuccess = {
  ticketNumber: string;
  customerEmail: string;
  emailConfirmationSent: boolean;
};

type ContactIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

const initialForm: FormState = {
  name: "",
  email: "",
  category: SUPPORT_CATEGORIES[0],
  subject: "",
  message: "",
  honeypot: "",
};

function createIdempotencyKey() {
  if (
    typeof crypto !== "undefined" &&
    "randomUUID" in crypto
  ) {
    return crypto.randomUUID();
  }

  return `contact-${Date.now()}`;
}

export default function ContactPage() {
  const {
    user,
    isDemo,
    loading: permissionsLoading,
  } = usePermissions();

  const [form, setForm] =
    useState<FormState>(initialForm);

  const [
    loadingProfile,
    setLoadingProfile,
  ] = useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [submission, setSubmission] =
    useState<SubmissionSuccess | null>(
      null
    );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    idempotencyKey,
    setIdempotencyKey,
  ] = useState(() => createIdempotencyKey());

  useEffect(() => {
    async function loadContactDetails() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoadingProfile(true);

        if (!user || isDemo) {
          return;
        }

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error(
            "Unable to load contact profile:",
            profileError
          );
        }

        setForm((current) => ({
          ...current,
          name:
            profile?.full_name?.trim() ||
            "",
          email: user.email || "",
        }));
      } finally {
        setLoadingProfile(false);
      }
    }

    loadContactDetails();
  }, [
    user,
    isDemo,
    permissionsLoading,
  ]);

  function updateField(
    field: keyof FormState,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSubmission(null);
    setErrorMessage("");
  }

  function resetForAnotherRequest() {
    setSubmission(null);
    setErrorMessage("");
    setIdempotencyKey(createIdempotencyKey());
    setForm((current) => ({
      ...initialForm,
      name: current.name,
      email: current.email,
    }));
  }

  async function submitContactForm(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const category =
      form.category.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();

    if (
      !name ||
      !email ||
      !category ||
      !subject ||
      !message
    ) {
      setErrorMessage(
        "Please complete all required fields."
      );

      return;
    }

    try {
      setSubmitting(true);
      setSubmission(null);
      setErrorMessage("");

      const response = await fetch(
        "/api/support/tickets",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            category,
            subject,
            message,
            honeypot: form.honeypot,
            idempotencyKey,
            isDemo,
            sourcePage:
              typeof window !== "undefined"
                ? window.location.href
                : null,
          }),
        }
      );

      const payload =
        (await response.json()) as {
          ticketNumber?: string;
          customerEmail?: string;
          emailConfirmationSent?: boolean;
          error?: string;
        };

      if (!response.ok) {
        setErrorMessage(
          payload.error ||
            "We couldn't save your support request right now. Please try again in a moment."
        );
        return;
      }

      if (
        !payload.ticketNumber ||
        !payload.customerEmail
      ) {
        setErrorMessage(
          "We couldn't save your support request right now. Please try again in a moment."
        );
        return;
      }

      setSubmission({
        ticketNumber: payload.ticketNumber,
        customerEmail: payload.customerEmail,
        emailConfirmationSent:
          payload.emailConfirmationSent !==
          false,
      });

      setForm((current) => ({
        ...initialForm,
        name: current.name,
        email: current.email,
      }));
    } catch (error) {
      console.error(
        "Unable to submit contact form:",
        error
      );

      setErrorMessage(
        "We couldn't save your support request right now. Please try again in a moment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const loading =
    permissionsLoading ||
    loadingProfile;

  const firstName =
    form.name.trim().split(" ")[0] ||
    "";

  const isSignedIn = Boolean(user) && !isDemo;

  const quickHelpLinks = isSignedIn
    ? [
        {
          href: "/settings",
          label: "Account settings",
        },
        {
          href: "/settings/billing",
          label: "Billing and subscription",
        },
        {
          href: "/devices",
          label: "Device library",
        },
        {
          href: "/network",
          label: "Network center",
        },
      ]
    : [
        {
          href: MARKETING_ROUTES.faq,
          label: "FAQ",
        },
        {
          href: MARKETING_ROUTES.trust,
          label: "Trust Center",
        },
        {
          href: MARKETING_ROUTES.demo,
          label: "Interactive demo",
        },
        {
          href: MARKETING_ROUTES.pricing,
          label: "Pricing",
        },
      ];

  return (
    <MarketingLayout>
      <MarketingPageHero
        eyebrow="Contact"
        title="We’re here to help."
        description="Send a support message, share feedback, or ask a question about your household vault. Every message is read by a real person."
      >
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-interaction hover:text-interaction-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
        >
          <Mail size={16} aria-hidden />
          {SUPPORT_EMAIL}
        </a>
      </MarketingPageHero>

      <MarketingContent className="pt-0">
        {isDemo ? (
        <section className="mb-6 rounded-3xl border border-warning/40 bg-warning-soft p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-charcoal text-surface-card">
              <Sparkles size={18} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-achievement">
                Demo Mode
              </p>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                You can still send a
                question or share feedback
                while exploring the demo.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <PageCard className="p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
              <MessageSquare size={22} />
            </div>

            <div>
              <p className="text-overline text-charcoal-soft">
                Send a Message
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
                {firstName
                  ? `What can I help with, ${firstName}?`
                  : "What can I help with?"}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                Tell me what happened,
                what you were trying to do,
                or what would make the app
                more useful for you.
              </p>
            </div>
          </div>

          {submission ? (
            <div className="mt-8 rounded-[24px] border border-emerald-200 bg-emerald-50 p-6 md:p-8">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={22}
                  className="mt-0.5 shrink-0 text-emerald-700"
                />

                <div>
                  <h3 className="text-xl font-semibold text-emerald-900">
                    Message received.
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-emerald-800">
                    Your support request number is:
                  </p>

                  <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-emerald-900">
                    {submission.ticketNumber}
                  </p>

                  <p className="mt-4 text-sm leading-7 text-emerald-800">
                    {submission.emailConfirmationSent
                      ? "We sent a confirmation to:"
                      : "Your request was saved successfully. Email confirmation may be delayed."}
                  </p>

                  {submission.emailConfirmationSent ? (
                    <p className="mt-1 text-sm font-semibold text-emerald-900">
                      {submission.customerEmail}
                    </p>
                  ) : null}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    {isSignedIn ? (
                      <Button href="/dashboard">
                        Return to Home Pulse
                      </Button>
                    ) : (
                      <Button href="/">
                        Return Home
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={
                        resetForAnotherRequest
                      }
                    >
                      Submit another request
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="mt-8 flex min-h-52 items-center justify-center rounded-[24px] bg-surface-sunken text-text-secondary">
              <Loader2
                size={21}
                className="mr-3 animate-spin"
              />

              Loading your details...
            </div>
          ) : (
            <form
              onSubmit={
                submitContactForm
              }
              className="mt-8 space-y-5"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Your name"
                  value={form.name}
                  onChange={(value) =>
                    updateField(
                      "name",
                      value
                    )
                  }
                  placeholder="What should I call you?"
                  required
                />

                <Field
                  label="Email address"
                  value={form.email}
                  onChange={(value) =>
                    updateField(
                      "email",
                      value
                    )
                  }
                  placeholder="you@example.com"
                  type="email"
                  required
                />
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-text-primary">
                  Category
                </span>

                <select
                  value={form.category}
                  onChange={(event) =>
                    updateField(
                      "category",
                      event.target.value
                    )
                  }
                  required
                  className="w-full rounded-2xl border border-border-subtle bg-white px-4 py-3.5 text-sm text-text-primary outline-none transition focus:border-interaction focus:ring-4 focus:ring-interaction/10"
                >
                  {SUPPORT_CATEGORIES.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </label>

              <Field
                label="Subject"
                value={form.subject}
                onChange={(value) =>
                  updateField(
                    "subject",
                    value
                  )
                }
                placeholder="A quick summary of your message"
                required
              />

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-text-primary">
                  Message
                </span>

                <textarea
                  value={form.message}
                  onChange={(event) =>
                    updateField(
                      "message",
                      event.target.value
                    )
                  }
                  placeholder="Share as much detail as you can. Screens, error messages, and what you expected to happen are especially helpful."
                  required
                  rows={8}
                  className="w-full resize-y rounded-2xl border border-border-subtle bg-white px-4 py-3.5 text-sm leading-6 text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-interaction focus:ring-4 focus:ring-interaction/10"
                />
              </label>

              <input
                type="text"
                name="company"
                value={form.honeypot}
                onChange={(event) =>
                  updateField(
                    "honeypot",
                    event.target.value
                  )
                }
                autoComplete="off"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden"
              />

              {errorMessage && (
                <div className="rounded-[22px] border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                  {errorMessage}
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-border-subtle pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-text-tertiary">
                  Please do not include
                  passwords or full payment
                  information.
                </p>

                <Button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={17} />
                  )}

                  {submitting
                    ? "Sending..."
                    : "Send Support Request"}
                </Button>
              </div>
            </form>
          )}
        </PageCard>

        <div className="space-y-6">
          <PageCard className="overflow-hidden p-0"><div className="htv-plan-band p-7 text-text-primary md:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-white/10 text-interaction">
              <Mail size={21} />
            </div>

            <p className="mt-6 text-overline text-charcoal-soft">
              A Note From Me
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              I read every message.
            </h2>

            <p className="mt-3 text-sm leading-7 text-text-secondary">
              Home Tech Vault started as
              an idea to make home
              technology easier to manage.
              Your questions and feedback
              genuinely help shape what I
              build next.
            </p>

            <p className="mt-5 text-sm font-semibold text-text-primary">
              — Jason
            </p>

            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-interaction transition hover:text-interaction-hover"
            >
              {SUPPORT_EMAIL}
              <ArrowRight size={15} />
            </a>
          </div>
          </PageCard>

          <PageCard className="p-6 md:p-7">
            <SupportItem
              icon={Clock3}
              title="A thoughtful reply"
              description="I aim to respond within one business day whenever possible."
            />

            <SupportItem
              icon={ShieldCheck}
              title="Your privacy matters"
              description="Only share the information needed to understand your question."
            />

            <SupportItem
              icon={HelpCircle}
              title="Details help"
              description="Include the page, error message, and what you expected to happen."
            />
          </PageCard>

          <PageCard className="p-6 md:p-7">
            <p className="text-overline text-charcoal-soft">
              Quick Help
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
              You may find it here
            </h2>

            <div className="mt-6 space-y-3">
              {quickHelpLinks.map((link) => (
                <QuickLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                />
              ))}
            </div>
          </PageCard>
        </div>
      </section>
      </MarketingContent>
    </MarketingLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        required={required}
        className="w-full rounded-2xl border border-border-subtle bg-white px-4 py-3.5 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-interaction focus:ring-4 focus:ring-interaction/10"
      />
    </label>
  );
}

function SupportItem({
  icon: Icon,
  title,
  description,
}: {
  icon: ContactIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-border-subtle py-5 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
        <Icon size={18} />
      </div>

      <div>
        <p className="font-semibold text-text-primary">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-[20px] bg-surface-sunken px-4 py-3.5 text-sm font-semibold text-text-primary transition hover:bg-[#EEEAE1]"
    >
      {label}

      <ArrowRight
        size={15}
        className="text-text-tertiary transition group-hover:translate-x-0.5 group-hover:text-text-primary"
      />
    </Link>
  );
}
