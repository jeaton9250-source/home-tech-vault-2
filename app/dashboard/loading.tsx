import PageShell from "@/components/ui/PageShell";
import {
  DashboardSkeleton,
} from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <PageShell>
      <DashboardSkeleton />
    </PageShell>
  );
}
