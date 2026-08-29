import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Home,
  ShieldCheck,
  Users,
} from "lucide-react";

const personalBenefits = [
  "Organize devices and home technology",
  "Track warranties and important documents",
  "Manage maintenance and subscriptions",
] as const;

const realtorBenefits = [
  "Create and manage Client Vaults",
  "Prepare properties before closing",
  "Gift and transfer vaults to buyers",
] as const;

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#f8f5ef] text-[#183047]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-[-0.02em] text-[#183047]"
          >
            Home Tech Vault
          </Link>

          <Link
            href="/login"
            className="text-sm font-medium text-[#617c43] hover:underline"
          >
            Already have an account? Sign in
          </Link>
        </header>

        <section className="flex flex-1 items-center justify-center py-16">
          <div className="w-full">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#183047] text-white">
                <ShieldCheck size={23} />
              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#617c43]">
                Create your account
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                How will you use
                <br className="hidden sm:block" /> Home Tech Vault?
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#183047]/60 sm:text-lg">
                Choose the workspace that fits you.
                You&apos;ll get an experience designed
                specifically for how you use Home Tech Vault.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
              <Link
                href="/signup/personal"
                className="group relative flex min-h-[390px] flex-col rounded-[30px] border border-[#183047]/10 bg-white p-8 shadow-[0_22px_65px_rgba(24,48,71,0.07)] transition duration-200 hover:-translate-y-1 hover:border-[#617c43]/35 hover:shadow-[0_28px_75px_rgba(24,48,71,0.12)] sm:p-10"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf1e8] text-[#617c43]">
                  <Home size={26} />
                </div>

                <div className="mt-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#617c43]">
                    For homeowners
                  </p>

                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">
                    Personal Vault
                  </h2>

                  <p className="mt-4 leading-7 text-[#183047]/60">
                    Keep your home&apos;s technology,
                    warranties, documents, maintenance,
                    subscriptions, and important details
                    organized in one secure place.
                  </p>
                </div>

                <div className="mt-7 space-y-3">
                  {personalBenefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2
                        size={17}
                        className="mt-0.5 shrink-0 text-[#617c43]"
                      />
                      <span className="text-sm text-[#183047]/70">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between pt-9 font-semibold text-[#183047]">
                  <span>Create Personal Vault</span>
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>

              <Link
                href="/realtors/signup"
                className="group relative flex min-h-[390px] flex-col overflow-hidden rounded-[30px] bg-[#183047] p-8 text-white shadow-[0_22px_65px_rgba(24,48,71,0.18)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(24,48,71,0.25)] sm:p-10"
              >
                <div className="absolute right-0 top-0 h-40 w-40 translate-x-14 -translate-y-14 rounded-full bg-white/[0.04]" />

                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#b7cb9e]">
                  <BriefcaseBusiness size={26} />
                </div>

                <div className="relative mt-7">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#b7cb9e]">
                      For real estate professionals
                    </p>
                  </div>

                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">
                    Realtor Dashboard
                  </h2>

                  <p className="mt-4 leading-7 text-white/60">
                    Build Client Vaults before closing,
                    organize property technology, and give
                    buyers a polished digital home handoff.
                  </p>
                </div>

                <div className="relative mt-7 space-y-3">
                  {realtorBenefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2
                        size={17}
                        className="mt-0.5 shrink-0 text-[#b7cb9e]"
                      />
                      <span className="text-sm text-white/70">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="relative mt-auto flex items-center justify-between pt-9 font-semibold">
                  <span>Create Realtor Dashboard</span>
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>
            </div>

            <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2 text-center text-sm text-[#183047]/45">
              <Users size={15} />
              <span>
                Not sure? Personal Vault is best for
                managing your own home.
              </span>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pb-2 text-xs text-[#183047]/40">
          <Link
            href="/privacy"
            className="hover:text-[#183047]"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="hover:text-[#183047]"
          >
            Terms
          </Link>
          <Link
            href="/security"
            className="hover:text-[#183047]"
          >
            Security
          </Link>
        </footer>
      </div>
    </main>
  );
}
