import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Realtor Account | Home Tech Vault",
  description:
    "Create a free Home Tech Vault Realtor account and prepare a thoughtful home record as a closing gift for your buyers.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function RealtorSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
