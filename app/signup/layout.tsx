import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Home | Home Tech Vault",
  description:
    "Create a Home Tech Vault and start organizing the useful history of your home for free.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
