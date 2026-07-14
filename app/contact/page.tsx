"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  HelpCircle,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useDemoMode } from "@/hooks/useDemoMode";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type FormState = {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  category: "General Question",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const { user, isDemo, loading: demoLoading } = useDemoMode();

  const [form, setForm] = useState<FormState>(initialForm);

  const [loadingProfile, setLoadingProfile] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadContactDetails() {
      if (demoLoading) {
        return;
      }

      try {
        setLoadingProfile(true);

        if (!user || isDemo) {
          setLoadingProfile(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Unable to load contact profile:", profileError);
        }

        setForm((current) => ({
          ...current,
          name: profile?.full_name?.trim() || "",
          email: user.email || "",
        }));
      } finally {
        setLoadingProfile(false);
      }
    }

    loadContactDetails();
  }, [user, isDemo, demoLoading]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  }

  async function submitContactForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const category = form.category.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();

    if (!email || !category || !subject || !message) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      setSuccessMessage("");
      setErrorMessage("");

      const { error } = await supabase.from("contact_messages").insert({
        user_id: !isDemo && user ? user.id : null,
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
        "Your message was sent successfully. We’ll get back to you as soon as possible.",
      );

      setForm((current) => ({
        ...initialForm,
        name: current.name,
        email: current.email,
      }));
    } catch (error) {
      console.error("Unable to submit contact form:", error);

      setErrorMessage(
        error instanceof Error ? error.message : "Unable to send your message.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const loading = demoLoading || loadingProfile;

  return (
    <PageShell>
      <PageTitle
        eyebrow="Support"
        title="Contact Us"
        description="Need help with Home Tech Vault? Send us a message and we’ll point you in the right direction."
      />

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <PageCard>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
              <MessageSquare size={23} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                Send a Message
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-[#111827]">
                How can we help?
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Tell us what you’re working on, what went wrong, or what you’d
                like to see improved.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 flex min-h-48 items-center justify-center rounded-2xl bg-[#F7F5EF] text-neutral-500">
              <Loader2 size={21} className="mr-3 animate-spin" />
              Loading contact details...
            </div>
          ) : (
            <form onSubmit={submitContactForm} className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Name"
                  value={form.name}
                  onChange={(value) => updateField("name", value)}
                  placeholder="Your name"
                />

                <Field
                  label="Email"
                  value={form.email}
                  onChange={(value) => updateField("email", value)}
                  placeholder="you@example.com"
                  type="email"
                  required
                />
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#111827]">
                  Category
                </span>

                <select
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  className="w-full rounded-xl border border-[#E8E2D6] bg-white px-4 py-3 outline-none focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/20"
                >
                  <option>General Question</option>

                  <option>Account Support</option>

                  <option>Billing</option>

                  <option>Technical Issue</option>

                  <option>Feature Request</option>

                  <option>Bug Report</option>

                  <option>Other</option>
                </select>
              </label>

              <Field
                label="Subject"
                value={form.subject}
                onChange={(value) => updateField("subject", value)}
                placeholder="What can we help with?"
                required
              />

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#111827]">
                  Message
                </span>

                <textarea
                  value={form.message}
                  onChange={(event) =>
                    updateField("message", event.target.value)
                  }
                  placeholder="Please include any details that will help us understand the issue."
                  required
                  rows={8}
                  className="w-full resize-y rounded-2xl border border-[#E8E2D6] bg-white px-4 py-3 outline-none focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/20"
                />
              </label>

              {successMessage && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}

                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </PageCard>

        <div className="space-y-6">
          <PageCard className="bg-[#111827] text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#C8A96A]">
              <Mail size={22} />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
              Direct Support
            </p>

            <h2 className="mt-2 text-2xl font-semibold">Prefer email?</h2>

            <p className="mt-3 text-sm leading-6 text-white/60">
              You can also contact the Home Tech Vault team directly.
            </p>

            <a
              href="mailto:support@hometechvault.com"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white"
            >
              support@hometechvault.com
              <ArrowIcon />
            </a>
          </PageCard>

          <PageCard>
            <SupportItem
              icon={Clock3}
              title="Response time"
              description="Most messages receive a response within one business day."
            />

            <SupportItem
              icon={ShieldCheck}
              title="Account security"
              description="Never include passwords or full payment information in your message."
            />

            <SupportItem
              icon={HelpCircle}
              title="Helpful details"
              description="Include the page name, error message, and what you were trying to do."
            />
          </PageCard>

          <PageCard>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
              Quick Help
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#111827]">
              Common destinations
            </h2>

            <div className="mt-6 space-y-3">
              <QuickLink href="/settings" label="Account Settings" />

              <QuickLink
                href="/settings/billing"
                label="Billing & Subscription"
              />

              <QuickLink href="/devices" label="Device Inventory" />

              <QuickLink href="/network" label="Network Center" />
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
      <span className="mb-2 block text-sm font-semibold text-[#111827]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-[#E8E2D6] bg-white px-4 py-3 outline-none focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/20"
      />
    </label>
  );
}

function SupportItem({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Mail;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-[#E8E2D6] py-5 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F5EF] text-[#C8A96A]">
        <Icon size={19} />
      </div>

      <div>
        <p className="font-semibold text-[#111827]">{title}</p>

        <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-2xl bg-[#F7F5EF] px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#EEEAE1]"
    >
      {label}
      <ArrowIcon />
    </a>
  );
}

function ArrowIcon() {
  return <span aria-hidden="true">→</span>;
}
