import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Home Tech Vault",
  description:
    "Sign in to your Home Tech Vault to manage your home records, devices, warranties, documents, and maintenance.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
