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
  const params = searchParams ? await searchParams : undefined;

  const initialQuery = params?.q?.trim() || "";

  let initialResponse: SmartSearchResponse | null = null;

  if (initialQuery) {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user) {
      const { householdId, householdOwnerId } = await resolveHouseholdAccess(
        user.id,
        supabase,
      );

      initialResponse = await runSmartSearch({
        supabase,
        userId: user.id,
        householdId,
        householdOwnerId,
        query: initialQuery,
      });
    }
  }

  return (
    <PageShell className="space-y-6 md:space-y-9">
      <div className="mx-auto max-w-[1120px]">
        <header className="relative isolate overflow-hidden rounded-[30px] bg-[#183047] px-7 pb-20 pt-11 text-[#fffdf8] sm:px-12 sm:pt-14 lg:px-16">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-[#718d4f]/35 blur-[85px]" />
          <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#aac78d]">ASK HOME TECH VAULT</p>
          <h1 className="mt-5 max-w-3xl font-serif text-[clamp(3rem,6vw,5.8rem)] font-medium leading-[1.03] tracking-[-.05em]">
            Your home has answers.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-[1.8] text-[#d7dfe0]">
            Looking for a manual, a warranty, or the last time something was serviced? Ask about the details your home remembers.
          </p>
        </header>
        <div className="relative -mt-9 rounded-[26px] border border-[#ded8c8] bg-[#fffdf8] p-4 shadow-[0_18px_50px_rgba(24,48,71,0.08)] sm:p-7">
          <SmartSearch
            mode="page"
            variant="default"
            initialQuery={initialQuery}
            initialResponse={initialResponse}
          />
        </div>
      </div>
    </PageShell>
  );
}
