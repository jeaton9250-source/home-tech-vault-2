"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useDemoMode } from "@/hooks/useDemoMode";
import { demoDocuments } from "@/lib/demo/documents";
import PageHeader from "@/components/PageHeader";
import DeleteDocumentButton from "@/components/DeleteDocumentButton";


export default function DocumentsPage() {
  const { user, isDemo, loading } = useDemoMode();

  type DocumentRow = {
    id: string;
    file_type: string;
    file_url?: string;
    file_name: string;
    device_id?: string;
    device_name?: string;
  };

  type DeviceSimple = {
    id: string;
    device_name?: string;
  };

  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [devices, setDevices] = useState<DeviceSimple[]>([]);

  useEffect(() => {
    async function loadDocuments() {
      if (loading) return;

      if (isDemo || !user) {
        setDocuments(demoDocuments);
        setDevices([]);
        return;
      }

      const { data: documentData, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const { data: deviceData } = await supabase
        .from("devices")
        .select("id, device_name")
        .eq("user_id", user.id);

      if (error) {
        alert(error.message);
        return;
      }

      setDocuments(documentData || []);
      setDevices(deviceData || []);
    }

    loadDocuments();
  }, [user, isDemo, loading]);

  function getDeviceName(doc: DocumentRow) {
    if (isDemo) return doc.device_name || "Demo Device";

    const device = devices.find((item) => item.id === doc.device_id);
    return device?.device_name || "Unknown";
  }

  if (loading) {
    return <main className="p-8">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <PageHeader
        title={isDemo ? "Demo Document Vault" : "Document Vault"}
        description={
          isDemo
            ? "You are viewing sample documents. Sign in to manage your own files."
            : "Only documents connected to your account are shown here."
        }
        action={
          <Link
            href={isDemo ? "/login" : "/documents/upload"}
            className="bg-blue-950 text-white px-6 py-3 rounded-xl hover:bg-blue-900 transition"
          >
            {isDemo ? "Create Your Vault" : "+ Upload Document"}
          </Link>
        }
      />

      {documents.length === 0 && (
        <div className="bg-white rounded-2xl shadow p-10 mt-8 text-center">
          <FileText size={60} className="mx-auto text-blue-950 mb-4" />

          <h2 className="text-2xl font-bold">No Documents Yet</h2>

          <p className="text-gray-600 mt-2">
            Upload receipts, manuals, invoices, warranties, and device photos.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {documents.map((doc) => {
          const isDemoDoc = doc.id.startsWith("demo");

          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition p-6"
            >
              {doc.file_type === "Photo" && !isDemoDoc ? (
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
                Device: {getDeviceName(doc)}
              </p>

              <div className="flex gap-3 mt-6">
                {!isDemoDoc && (
                  <>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      className="flex-1 text-center bg-blue-950 text-white rounded-xl py-2"
                    >
                      Open
                    </a>

                    <DeleteDocumentButton documentId={doc.id} />
                  </>
                )}

                {isDemoDoc && (
                  <p className="text-sm text-gray-400">
                    Demo file — sign in to manage your own documents.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}