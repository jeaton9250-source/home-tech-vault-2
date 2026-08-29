import DashboardPageClient from "@/components/dashboard/DashboardPageClient";
import {
  loadDashboardMetrics,
} from "@/lib/data/dashboardData";
import {
  fetchHouseholdIdForUser,
} from "@/lib/data/householdScope";
import {
  createClient,
} from "@/lib/supabase/server";
import {
  createAdminClient,
} from "@/lib/supabase/admin";
import {
  resolveActiveClientVault,
} from "@/lib/realtor/clientVaultMode";

export const dynamic =
  "force-dynamic";

export default async function DashboardPage() {
  try {
    const supabase =
      await createClient();

    const {
      data: { user },
      error: userError,
    } =
      await supabase.auth.getUser();

    /*
     * No server session can also mean Demo Mode,
     * because Demo state lives in the browser.
     * Let the client component resolve that case.
     */
    if (
      userError ||
      !user
    ) {
      return (
        <DashboardPageClient
          initialMetrics={null}
          initialMetricsUserId={null}
          initialHouseholdId={null}
        />
      );
    }

    const activeClientVault =
      await resolveActiveClientVault(
        createAdminClient(),
        user.id
      );

    const householdId =
      activeClientVault?.householdId ??
      (await fetchHouseholdIdForUser(
        user.id,
        supabase
      ));

    const initialMetrics =
      await loadDashboardMetrics(
        user,
        householdId,
        supabase
      );

    return (
      <DashboardPageClient
        initialMetrics={
          initialMetrics
        }
        initialMetricsUserId={
          user.id
        }
        initialHouseholdId={
          householdId
        }
      />
    );
  } catch (error) {
    /*
     * Server-first loading is an optimization,
     * not a single point of failure.
     *
     * If this request fails, the existing client
     * loader gets another chance once permissions
     * are available.
     */
    console.error(
      "Server dashboard preload failed:",
      error
    );

    return (
      <DashboardPageClient
        initialMetrics={null}
        initialMetricsUserId={null}
        initialHouseholdId={null}
      />
    );
  }
}
