import PageShell from "@/components/ui/PageShell";
import SmartSearch from "@/components/search/SmartSearch";
import { resolveHouseholdAccess } from "@/lib/data/householdScope";
import { runSmartSearch } from "@/lib/search/deviceSearch";
import type { SmartSearchResponse } from "@/lib/search/searchTypes";
import { createClient } from "@/lib/supabase/server";

type SmartSearchPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function SmartSearchPage({
  searchParams,
}: SmartSearchPageProps) {
  const params = searchParams
    ? await searchParams
    : undefined;

  const initialQuery =
    params?.q?.trim() || "";

  let initialResponse: SmartSearchResponse | null = null;

  if (initialQuery) {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user) {
      const {
        householdId,
        householdOwnerId,
      } = await resolveHouseholdAccess(
        user.id,
        supabase
      );

      initialResponse =
        await runSmartSearch({
          supabase,
          userId: user.id,
          householdId,
          householdOwnerId,
          query: initialQuery,
        });
    }
  }

  return (
    <PageShell className="space-y-6 md:space-y-8">
      <header className="space-y-2">
        <p className="text-overline text-text-muted">
          Smart Search
        </p>
        <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-medium tracking-[-0.03em] text-text-primary">
          Search your home
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary">
          Your full search workspace for devices, documents,
          warranties, maintenance, and network details.
        </p>
      </header>

      <SmartSearch
        mode="page"
        variant="default"
        initialQuery={initialQuery}
        initialResponse={initialResponse}
      />
    </PageShell>
  );
}
