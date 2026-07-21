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
  UserRound,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { usePermissions } from "@/hooks/usePermissions";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type FormState = {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
};

type ContactIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

const initialForm: FormState = {
  name: "",
  email: "",
  category: "General Question",
  subject: "",
  message: "",
};

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

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

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

    setSuccessMessage("");
    setErrorMessage("");
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
      setSuccessMessage("");
      setErrorMessage("");

      const { error } = await supabase
        .from("contact_messages")
        .insert({
          user_id:
            !isDemo && user
              ? user.id
              : null,
          name: name || null,
          email,
          category,
          subject,
          message,
        });

      if (error) {
        throw error;
      }

      setSuccessMessage(
        "Thanks for reaching out. Your message made it to me, and I’ll get back to you as soon as I can."
      );

      setForm((current) => ({
        ...initialForm,
        name: current.name,
        email: current.email,
      }));
    } catch (error: unknown) {
      const possibleError =
        error as {
          message?: string;
          details?: string;
        };

      console.error(
        "Unable to submit contact form:",
        error
      );

      setErrorMessage(
        possibleError.message ||
          possibleError.details ||
          "Unable to send your message."
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

  return (
    <PageShell>
      <section className="htv-hero-band overflow-hidden shadow-sm">
        <div className="grid gap-8 px-6 py-9 md:px-10 md:py-11 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-overline text-charcoal-soft">
              Personal Support
            </p>

            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              Let’s figure it out together.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary md:text-base">
              Questions, ideas, bugs, and
              honest feedback are all
              welcome. Your message goes to
              a real person who cares about
              making Home Tech Vault better.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-[24px] bg-white/10 px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-surface-card text-section-insights shadow-[var(--shadow-sm)]">
              <UserRound size={20} />
            </div>

            <div>
              <p className="text-sm font-semibold">
                You’re reaching Jason
              </p>

              <p className="mt-0.5 text-xs text-text-tertiary">
                Founder of Home Tech Vault
              </p>
            </div>
          </div>
        </div>
      </section>

      {isDemo && (
        <section className="rounded-3xl border border-warning/40 bg-warning-soft p-5">
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
      )}

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

          {loading ? (
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
                  What is this about?
                </span>

                <select
                  value={form.category}
                  onChange={(event) =>
                    updateField(
                      "category",
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-border-subtle bg-white px-4 py-3.5 text-sm text-text-primary outline-none transition focus:border-interaction focus:ring-4 focus:ring-interaction/10"
                >
                  <option>
                    General Question
                  </option>

                  <option>
                    Account Support
                  </option>

                  <option>
                    Billing
                  </option>

                  <option>
                    Technical Issue
                  </option>

                  <option>
                    Feature Request
                  </option>

                  <option>
                    Bug Report
                  </option>

                  <option>
                    Feedback
                  </option>

                  <option>
                    Other
                  </option>
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
                  Tell me more
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

              {successMessage && (
                <div className="flex items-start gap-3 rounded-[22px] border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  {successMessage}
                </div>
              )}

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
                    : "Send to Jason"}
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
              href="mailto:support@hometechvault.com"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-interaction transition hover:text-interaction-hover"
            >
              support@hometechvault.com
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
              <QuickLink
                href="/settings"
                label="Account settings"
              />

              <QuickLink
                href="/settings/billing"
                label="Billing and subscription"
              />

              <QuickLink
                href="/devices"
                label="Device library"
              />

              <QuickLink
                href="/network"
                label="Network center"
              />
            </div>
          </PageCard>
        </div>
      </section>
    </PageShell>
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