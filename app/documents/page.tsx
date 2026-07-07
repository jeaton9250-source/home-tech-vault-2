import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import DeleteDocumentButton from "@/components/DeleteDocumentButton";
import { FileText, ImageIcon } from "lucide-react";

export default async function DocumentsPage() {
  const { data: documents, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: devices } = await supabase
    .from("devices")
    .select("id, device_name");

  if (error) {
    return <main className="p-8">Error: {error.message}</main>;
  }

  function getDeviceName(deviceId: string) {
    const device = devices?.find((item) => item.id === deviceId);
    return device?.device_name || "Unknown";
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <PageHeader
        title="Document Vault"
        description="Store receipts, manuals, warranties, invoices, and device photos."
        action={
          <Link
            href="/documents/upload"
            className="bg-blue-950 text-white px-6 py-3 rounded-xl hover:bg-blue-900 transition"
          >
            + Upload Document
          </Link>
        }
      />

      {documents?.length === 0 && (
        <div className="bg-white rounded-2xl shadow p-10 mt-8 text-center">
          <FileText size={60} className="mx-auto text-blue-950 mb-4" />

          <h2 className="text-2xl font-bold">No Documents Yet</h2>

          <p className="text-gray-600 mt-2">
            Upload receipts, manuals, invoices, warranties, and device photos.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {documents?.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl shadow hover:shadow-lg transition p-6"
          >
            {doc.file_type === "Photo" ? (
              <img
                src={doc.file_url}
                alt={doc.file_name}
                className="w-full h-48 object-cover rounded-xl"
              />
            ) : (
              <div className="bg-blue-50 rounded-xl p-8 flex justify-center">
                <ImageIcon size={60} className="text-blue-950" />
              </div>
            )}

            <p className="text-sm text-gray-500 mt-5">{doc.file_type}</p>

            <h2 className="font-bold text-xl text-blue-950 mt-1 break-all">
              {doc.file_name}
            </h2>

            <p className="text-gray-500 mt-2">
              Device: {getDeviceName(doc.device_id)}
            </p>

            <div className="flex gap-3 mt-6">
              <a
                href={doc.file_url}
                target="_blank"
                className="flex-1 text-center bg-blue-950 text-white rounded-xl py-2"
              >
                Open
              </a>

              <DeleteDocumentButton documentId={doc.id} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}