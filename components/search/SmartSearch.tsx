"use client";

import {
  FormEvent,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Loader2, Search } from "lucide-react";

import { usePermissions } from "@/hooks/usePermissions";
import { demoDevices, demoDocuments, demoMaintenance } from "@/lib/demoData";
import { parseSearchQuery } from "@/lib/search/queryParser";
import SearchResults from "@/components/search/SearchResults";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";
import {
  emptySearchResults,
  type SmartSearchResponse,
} from "@/lib/search/searchTypes";

type SmartSearchMode = "dashboard" | "page";

type SmartSearchProps = {
  mode?: SmartSearchMode;
  heading?: string;
  initialQuery?: string;
  initialResponse?: SmartSearchResponse | null;
};

function buildDemoResponse(query: string): SmartSearchResponse {
  const intent = parseSearchQuery(query);
  const results = emptySearchResults();
  const normalized = intent.normalized;

  const includes = (value: string | null | undefined) =>
    (value ?? "").toLowerCase().includes(normalized);

  if (normalized) {
    for (const device of demoDevices) {
      const haystack = [
        device.device_name,
        device.brand,
        device.model_number,
        device.serial_number,
        device.category,
        device.location,
        device.notes,
        device.ip_address,
        device.mac_address,
        device.manufacturer,
      ]
        .join(" ")
        .toLowerCase();

      if (haystack.includes(normalized)) {
        results.devices.push({
          id: `demo-device-${device.id}`,
          group: "devices",
          title: device.device_name,
          subtitle: [device.brand, device.model_number].filter(Boolean).join(" • "),
          location: device.location,
          status: device.online ? "Online" : "Offline",
          href: `/devices/${device.id}`,
          match: {
            field: "Device",
            value: device.device_name,
          },
        });
      }

      if (includes(device.warranty_date)) {
        results.warranties.push({
          id: `demo-warranty-${device.id}`,
          group: "warranties",
          title: device.device_name,
          subtitle: device.brand,
          location: device.location,
          status: `Protected until ${device.warranty_date}`,
          href: `/devices/${device.id}`,
          match: {
            field: "Warranty",
            value: device.warranty_date,
          },
        });
      }
    }

    for (const task of demoMaintenance) {
      const haystack = [task.title, task.device_name, task.notes].join(" ").toLowerCase();

      if (haystack.includes(normalized)) {
        results.maintenance.push({
          id: `demo-maintenance-${task.id}`,
          group: "maintenance",
          title: task.title,
          subtitle: `Device: ${task.device_name}`,
          status: task.status,
          href: "/maintenance",
          match: {
            field: "Maintenance",
            value: task.title,
          },
        });
      }
    }

    for (const document of demoDocuments) {
      const haystack = [
        document.document_name,
        document.file_name,
        document.document_type,
      ]
        .join(" ")
        .toLowerCase();

      if (haystack.includes(normalized)) {
        results.documents.push({
          id: `demo-document-${document.id}`,
          group: "documents",
          title: document.document_name,
          subtitle: document.file_name,
          status: document.document_type,
          href: "/documents",
          match: {
            field: "Document",
            value: document.document_name,
          },
        });
      }
    }

    for (const networkItem of demoDevices) {
      const haystack = [
        networkItem.device_name,
        networkItem.ip_address,
        networkItem.mac_address,
        networkItem.manufacturer,
      ]
        .join(" ")
        .toLowerCase();

      if (haystack.includes(normalized)) {
        results.network.push({
          id: `demo-network-${networkItem.id}`,
          group: "network",
          title: networkItem.device_name,
          subtitle: networkItem.manufacturer,
          status: networkItem.online ? "Online" : "Offline",
          href: "/network?tab=discovery",
          match: {
            field: "Network",
            value: networkItem.mac_address,
          },
        });
      }
    }
  }

  const total =
    results.devices.length +
    results.warranties.length +
    results.maintenance.length +
    results.documents.length +
    results.network.length;

  return {
    success: true,
    query,
    intent,
    results,
    total,
    suggestions: [
      "Which devices are offline?",
      "What warranties expire soon?",
      "Where is my router receipt?",
      "Show devices that need maintenance",
    ],
  };
}

export default function SmartSearch({
  mode = "page",
  heading,
  initialQuery = "",
  initialResponse = null,
}: SmartSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { isDemo } = usePermissions();

  const urlQuery = searchParams.get("q")?.trim() || "";

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<SmartSearchResponse | null>(
    initialResponse
  );

  const activeQuery =
    mode === "page"
      ? query || urlQuery || initialQuery
      : query;

  async function runSearch(value: string) {
    const trimmed = value.trim();

    if (!trimmed) {
      setResponse(null);
      setError("");
      return;
    }

    if (isDemo) {
      setResponse(buildDemoResponse(trimmed));
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const routeResponse = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await routeResponse.json()) as SmartSearchResponse & {
        error?: string;
      };

      if (!routeResponse.ok || payload.success === false) {
        throw new Error(payload.error || "Unable to search your home technology.");
      }

      setResponse(payload);
    } catch (searchError) {
      setResponse(null);
      setError(searchError instanceof Error ? searchError.message : "Unable to search your home technology.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = activeQuery.trim();

    if (!trimmed) {
      setResponse(null);
      setError("");
      return;
    }

    if (mode === "dashboard") {
      router.push(`/smart-search?q=${encodeURIComponent(trimmed)}`);
      return;
    }

    router.replace(`${pathname}?q=${encodeURIComponent(trimmed)}`);
    void runSearch(trimmed);
  }

  return (
    <div className="space-y-4">
      <PageCard>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken text-charcoal">
            <Search size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-text-primary">{heading || "Smart Search"}</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Ask about devices, warranties, maintenance, documents, or network status.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                type="search"
                value={activeQuery}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try: Which devices are offline?"
                className="htv-focus-ring w-full rounded-[var(--radius-input)] border border-border-subtle bg-surface-sunken px-4 py-2.5 text-sm text-text-primary outline-none focus:border-interaction"
                aria-label="Smart search"
              />

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                Search
              </Button>
            </form>
          </div>
        </div>
      </PageCard>

      {mode === "page" ? (
        <SearchResults
          response={activeQuery.trim() ? response : null}
          loading={loading}
          error={error}
        />
      ) : null}
    </div>
  );
}
