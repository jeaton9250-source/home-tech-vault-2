import AdminDeviceDetailClient from "@/components/admin/devices/AdminDeviceDetailClient";

export const metadata = {
  title: "Device Details — Home Tech Vault Admin",
};

type AdminDeviceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminDeviceDetailPage({
  params,
}: AdminDeviceDetailPageProps) {
  const { id } = await params;

  return <AdminDeviceDetailClient deviceId={id} />;
}
