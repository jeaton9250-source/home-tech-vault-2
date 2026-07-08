import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "Home Tech Vault",
  description: "Organize. Protect. Simplify.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthGuard>
          <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <div className="flex-1">
              <TopBar />
              {children}
            </div>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}