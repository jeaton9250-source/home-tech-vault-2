import ConnectorsAdminClient from "@/components/admin/connectors/ConnectorsAdminClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Connectors — Home Tech Vault Admin",
};

export default function AdminConnectorsPage() {
  return <ConnectorsAdminClient />;
}
