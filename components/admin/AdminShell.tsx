import AdminControlCenterHeader from "@/components/admin/AdminControlCenterHeader";
import AdminMobileNav from "@/components/admin/AdminMobileNav";

type AdminShellProps = {
  children: React.ReactNode;
};

export default function AdminShell({
  children,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-surface-base">
      <AdminMobileNav />
      <AdminControlCenterHeader />

      <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
