import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";

export default async function DocumentsPage() {
  const { data: documents, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <main className="p-8">Error: {error.message}</main>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <PageHeader
        title="Document Vault"
        description="Store receipts, manuals, warranties, invoices, and device files."
        action={
          <Link
            href="/documents/upload"
            className="bg-blue-950 text-white px-6 py-3 rounded-xl"
          >
            + Upload Document
          </Link>
        }
      />

      {documents?.length === 0 && (
        <div className="bg-white rounded-2xl shadow p-10 mt-8 text-center">
          <h2 className="text-2xl font-bold text-blue-950">
            No documents uploaded yet
          </h2>

          <p className="text-gray-600 mt-2">
            Upload receipts, manuals, warranty PDFs, invoices, and photos.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {documents?.map((doc) => (
          <a
            key={doc.id}
            href={doc.file_url}
            target="_blank"
            className="bg-white rounded-2xl shadow p-6 border border-gray-100 hover:shadow-lg transition"
          >
            <p className="text-sm text-gray-500">{doc.file_type}</p>
            <h2 className="text-xl font-bold text-blue-950 mt-2">
              {doc.file_name}
            </h2>
            <p className="text-gray-500 mt-4">Open file →</p>
          </a>
        ))}
      </div>
    </main>
  );
}