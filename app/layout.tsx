import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import MobileNav from "@/components/MobileNav";
import AuthGuard from "@/components/AuthGuard";

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
          <div className="flex min-h-screen bg-[#F6F7F9]">
            <Sidebar />

            <div className="flex-1 pb-20 lg:pb-0">
              <TopBar />
             {children}
            <MobileNav />
          </div>
          
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}