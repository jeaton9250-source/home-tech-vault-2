import { createPageMetadata } from "@/lib/marketing/metadata";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

export const metadata = createPageMetadata({
  title: "Contact — Personal Support",
  description:
    "Reach Home Tech Vault for account help, billing questions, feature requests, and product feedback.",
  path: MARKETING_ROUTES.contact,
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
