import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
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
    <PageShell className="space-y-6">
      <PageTitle
        eyebrow="Home Technology Command Center"
        title="Smart Search"
        description="Find what you own, where it is, how it is performing, and what needs attention."
      />

      <SmartSearch
        mode="page"
        initialQuery={initialQuery}
        initialResponse={initialResponse}
      />
    </PageShell>
  );
}
