import Button from "@/components/ui/Button";
import { resolveNetworkHeaderActions } from "@/lib/network/headerActions";
import type { NetworkSummary } from "@/lib/network/summary";

type NetworkHeaderProps = {
  summary: NetworkSummary | null;
  headerSummary: string | null;
  loading: boolean;
};

export default function NetworkHeader({
  summary,
  headerSummary,
  loading,
}: NetworkHeaderProps) {
  const actions = summary
    ? resolveNetworkHeaderActions(summary)
    : null;

  return (
    <header className="mb-8">
      <p className="text-overline text-section-network">Network</p>

      <div className="mt-2 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-text-primary md:text-4xl">
            Your home network
          </h1>
          <p className="mt-3 text-sm leading-7 text-text-secondary md:text-base">
            See what is connected, review new devices, and manage monitoring
            from one place.
          </p>

          {loading ? (
            <div className="mt-4 h-5 w-full max-w-xl animate-pulse rounded-full bg-surface-sunken" />
          ) : headerSummary ? (
            <p className="mt-4 text-sm font-medium text-text-primary">
              {headerSummary}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button href={actions.primary.href}>
              {actions.primary.label}
              {actions.primary.badgeCount ? (
                <span className="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
                  {actions.primary.badgeCount}
                </span>
              ) : null}
            </Button>
            <Button href={actions.secondary.href} variant="secondary">
              {actions.secondary.label}
              {actions.secondary.badgeCount ? (
                <span className="ml-2 rounded-full bg-charcoal/10 px-2 py-0.5 text-xs font-semibold">
                  {actions.secondary.badgeCount}
                </span>
              ) : null}
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
