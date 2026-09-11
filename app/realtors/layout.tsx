import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A Closing Gift for the Home | Home Tech Vault",
  description:
    "Give buyers a beautifully prepared record of their new home—a thoughtful Realtor closing gift they can use for years.",
};

export default function RealtorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
