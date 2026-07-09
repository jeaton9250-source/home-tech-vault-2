type SmartSummaryProps = {
  warrantiesExpiring: number;
  renewalsComing: number;
  missingWarranty: number;
  missingSerials: number;
};

export default function SmartSummary({
  warrantiesExpiring,
  renewalsComing,
  missingWarranty,
  missingSerials,
}: SmartSummaryProps) {
  const totalIssues =
    warrantiesExpiring + renewalsComing + missingWarranty + missingSerials;

  return (
    <section className="rounded-[32px] border border-neutral-200 bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
        Smart Summary
      </p>

      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
        {totalIssues > 0
          ? `I found ${totalIssues} things that need attention.`
          : "Everything looks organized."}
      </h2>

      <div className="mt-6 space-y-3 text-neutral-600">
        <p>• {warrantiesExpiring} warranties expire soon.</p>
        <p>• {renewalsComing} subscriptions renew soon.</p>
        <p>• {missingWarranty} devices are missing warranty dates.</p>
        <p>• {missingSerials} devices are missing serial numbers.</p>
      </div>
    </section>
  );
}