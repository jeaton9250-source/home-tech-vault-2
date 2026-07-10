import type { Metadata } from "next";
import "./globals.css";

import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import MobileNav from "@/components/MobileNav";
import AuthGuard from "@/components/AuthGuard";
import AIAdvisorPopup from "@/components/ai/AIAdvisorPopup";
import DemoBanner from "@/components/DemoBanner";

export const metadata: Metadata = {
  title: "Home Tech Vault",
  description: "Organize. Protect. Simplify.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthGuard>
          <DemoBanner />

          <div className="flex min-h-screen bg-[#F7F5EF]">
            <Sidebar />

            <div className="min-w-0 flex-1 pb-20 lg:pb-0">
              <TopBar />

              <main>{children}</main>

              <MobileNav />
            </div>

            <AIAdvisorPopup />
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}