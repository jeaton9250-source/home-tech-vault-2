import {
  CheckCircle2,
  Forward,
  Mail,
  Sparkles,
} from "lucide-react";

export default function SmartImportDemoSection() {
  return (
    <section
      id="smart-import-demo"
      className="border-y border-border-subtle bg-surface-card px-5 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-[var(--content-max)]">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-home-health-soft px-3 py-1.5 text-xs font-semibold text-home-health">
            <Sparkles
              size={14}
              aria-hidden
            />

            Smart Import™
          </div>

          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-text-primary sm:text-4xl lg:text-5xl">
            Forward it.
            <br />
            We&apos;ll do the typing.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary">
            You already receive purchase
            confirmations when you buy
            something. Smart Import turns
            those emails into useful device
            records without making you enter
            everything twice.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <StepCard
            number="1"
            icon={Forward}
            title="Forward"
            description="Send the receipt or order confirmation you already have."
          />

          <StepCard
            number="2"
            icon={Sparkles}
            title="We organize it"
            description="Home Tech Vault pulls out useful product and purchase details."
          />

          <StepCard
            number="3"
            icon={CheckCircle2}
            title="You approve"
            description="Review everything before anything is added to your Vault."
          />
        </div>

        <div className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-[30px] border border-border-subtle bg-surface-base shadow-sm">
          <div className="grid md:grid-cols-[1fr_auto_1fr]">
            <div className="p-6 sm:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-sunken text-text-secondary">
                <Mail
                  size={19}
                  aria-hidden
                />
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                What you already have
              </p>

              <h3 className="mt-2 text-xl font-semibold text-text-primary">
                Order confirmation
              </h3>

              <div className="mt-5 rounded-2xl border border-border-subtle bg-surface-card p-4">
                <p className="text-xs text-text-muted">
                  Best Buy
                </p>

                <p className="mt-1 font-semibold text-text-primary">
                  LG 34&quot; UltraWide Monitor
                </p>

                <div className="mt-3 flex justify-between text-xs text-text-secondary">
                  <span>
                    Aug 12, 2026
                  </span>

                  <span className="font-semibold">
                    $349.99
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden items-center justify-center border-x border-border-subtle bg-home-health-soft/30 px-5 md:flex">
              <Forward
                size={22}
                className="text-home-health"
                aria-hidden
              />
            </div>

            <div className="border-t border-border-subtle p-6 sm:p-8 md:border-t-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
                <Sparkles
                  size={19}
                  aria-hidden
                />
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-home-health">
                What Home Tech Vault prepares
              </p>

              <h3 className="mt-2 text-xl font-semibold text-text-primary">
                Organized device record
              </h3>

              <div className="mt-5 space-y-2">
                <ImportedRow
                  label="Device"
                  value='LG 34" UltraWide Monitor'
                />

                <ImportedRow
                  label="Category"
                  value="Monitor"
                />

                <ImportedRow
                  label="Purchased"
                  value="Aug 12, 2026"
                />

                <ImportedRow
                  label="Price"
                  value="$349.99"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: typeof Forward;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[24px] border border-border-subtle bg-surface-base p-6">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
          <Icon
            size={19}
            aria-hidden
          />
        </div>

        <span className="text-sm font-bold text-text-muted">
          0{number}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-semibold text-text-primary">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {description}
      </p>
    </article>
  );
}

function ImportedRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-card px-3 py-2.5">
      <span className="text-xs text-text-muted">
        {label}
      </span>

      <span className="text-right text-xs font-semibold text-text-primary">
        {value}
      </span>
    </div>
  );
}