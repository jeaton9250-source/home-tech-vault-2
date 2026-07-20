import type { Metadata } from "next";
import "./globals.css";

import AuthGuard from "@/components/AuthGuard";
import AppChrome from "@/components/AppChrome";

export const metadata: Metadata = {
  title: "Home Tech Vault — Organize. Protect. Simplify.",
  description:
    "Home Tech Vault is the effortless way to catalog every device in your home, track warranties, store documents, and protect the technology you own.",
  keywords: [
    "home inventory",
    "device inventory",
    "warranty tracker",
    "home technology",
    "smart home management",
  ],
  openGraph: {
    title: "Home Tech Vault — Organize. Protect. Simplify.",
    description:
      "Catalog every device, track warranties, and protect the technology you own — all in one beautifully simple vault.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#F7F5EF]">
      <body>
        <AuthGuard>
          <AppChrome>{children}</AppChrome>
        </AuthGuard>
      </body>
    </html>
  );
}
