import { createPageMetadata } from "@/lib/marketing/metadata";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

export const metadata = createPageMetadata({
  title: "Interactive Demo",
  description:
    "Explore a complete sample Home Tech Vault with devices, warranties, documents, maintenance, and Home Wi-Fi details — no account required.",
  path: MARKETING_ROUTES.demo,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
