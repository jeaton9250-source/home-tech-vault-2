import AttentionCard from "./AttentionCard";
import DashboardSidebar from "./DashboardSidebar";
import DashboardStats from "./DashboardStats";
import DashboardTopbar from "./DashboardTopbar";
import HomeOverview from "./HomeOverview";
import HomeReadinessHero from "./HomeReadinessHero";
import QuickActions from "./QuickActions";
import RecentActivity from "./RecentActivity";
import SpacesAndSystems from "./SpacesAndSystems";

export default function PremiumDashboard() {
  return (
    <div className="min-h-screen bg-[#f7f7f4] text-[#142437]">
      <DashboardSidebar />

      <main className="min-h-screen xl:ml-[238px]">
        <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">

          {/* TOP BAR */}
          <DashboardTopbar />

          {/* GREETING */}
          <section className="mt-9">
            <h1 className="font-serif text-[42px] leading-none tracking-[-0.04em] text-[#142437] sm:text-[50px]">
              Good morning, Jason
            </h1>

            <p className="mt-3 text-base text-[#70808e]">
              Everything important about your home, right where you expect it.
            </p>
          </section>

          {/* HERO */}
          <HomeReadinessHero />

          {/* SUMMARY CARDS */}
          <DashboardStats />

          {/* MID GRID */}
          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr_0.9fr]">
            <HomeOverview />
            <AttentionCard />
            <RecentActivity />
          </div>

          {/* BOTTOM GRID */}
          <div className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.5fr]">
            <QuickActions />
            <SpacesAndSystems />
          </div>

          <div className="h-10" />
        </div>
      </main>
    </div>
  );
}
