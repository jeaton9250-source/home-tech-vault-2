import Link from "next/link";
import {
  ArrowRight,
  FileLock2,
  LockKeyhole,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const trustItems = [
  {
    icon: LockKeyhole,
    title: "Private by default",
    text:
      "Your vault is tied to authenticated account access and household permissions.",
  },
  {
    icon: FileLock2,
    title: "Protected uploads",
    text:
      "Device photos and documents use private storage with access policies.",
  },
  {
    icon: UsersRound,
    title: "Controlled sharing",
    text:
      "Household roles help determine who can view or manage shared information.",
  },
  {
    icon: ShieldCheck,
    title: "Secure connections",
    text:
      "HTTPS and modern browser protections help secure every Home Tech Vault session.",
  },
] as const;

export default function TrustSection() {
  return (
    <section
      id="privacy-and-security"
      className="relative overflow-hidden bg-[#183047] px-5 py-24 text-[#f5f1e8] md:px-8 md:py-32 lg:px-12"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-[#617c43]/20 blur-[140px]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -right-48 bottom-0 h-[500px] w-[500px] rounded-full bg-[#d8c7a7]/10 blur-[150px]"
      />

      <div className="relative mx-auto max-w-[1180px]">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#718d4f]/25 bg-[#718d4f]/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a9bd86]">
              <ShieldCheck
                size={14}
                aria-hidden
              />
              Privacy & security
            </div>

            <h2 className="mt-7 max-w-xl font-serif text-4xl font-medium leading-[1.06] tracking-[-0.045em] text-[#f5f1e8] sm:text-5xl lg:text-[3.5rem]">
              Built for the things you wouldn&apos;t post publicly.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-[#b7c0c7] sm:text-lg">
              Receipts, serial numbers, purchase history, documents, and
              Home Wi-Fi details belong in one organized place — without turning
              your home inventory into public information.
            </p>

            <Link
              href="/trust"
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-[#f5f1e8] transition hover:border-[#718d4f]/45 hover:bg-[#718d4f]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#718d4f]"
            >
              See how we protect your data
              <ArrowRight
                size={16}
                aria-hidden
              />
            </Link>

            <p className="mt-5 max-w-lg text-xs leading-5 text-white/45">
              Home Tech Vault does not expose a public device inventory,
              document library, or household record for your account.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {trustItems.map(
              ({
                icon: Icon,
                title,
                text,
              }) => (
                <article
                  key={title}
                  className="rounded-[24px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-sm transition hover:border-[#718d4f]/25 hover:bg-white/[0.065] sm:p-7"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#718d4f]/20 bg-[#718d4f]/10 text-[#a9bd86]">
                    <Icon
                      size={19}
                      aria-hidden
                    />
                  </div>

                  <h3 className="mt-6 text-base font-semibold tracking-[-0.015em] text-[#f5f1e8]">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#aeb8c1]">
                    {text}
                  </p>
                </article>
              )
            )}
          </div>
        </div>

        <div className="mt-14 grid gap-5 border-t border-white/10 pt-7 text-xs leading-5 text-white/45 sm:grid-cols-3">
          <p>
            Private storage for customer uploads
          </p>

          <p>
            Account and household access controls
          </p>

          <p>
            HTTPS and browser security protections
          </p>
        </div>
      </div>
    </section>
  );
}
