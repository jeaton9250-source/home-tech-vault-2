"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import {
  applyHouseholdMutationScope,
  loadNetworkInfoRows,
  withHouseholdInsertFields,
} from "@/lib/data/householdScope";
import { usePermissions } from "@/hooks/usePermissions";

export default function EditNetwork() {
  const {
    user,
    isDemo,
    householdId,
    householdOwnerId,
    canEdit,
    loading: permissionsLoading,
  } = usePermissions();

  const [id, setId] = useState<string | null>(
    null
  );
  const [loading, setLoading] =
    useState(true);

  const [isp, setIsp] = useState("");
  const [routerModel, setRouterModel] =
    useState("");
  const [modemModel, setModemModel] =
    useState("");
  const [wifiName, setWifiName] =
    useState("");
  const [
    wifiPasswordHint,
    setWifiPasswordHint,
  ] = useState("");
  const [guestNetwork, setGuestNetwork] =
    useState("");
  const [adminUrl, setAdminUrl] =
    useState("");
  const [downloadSpeed, setDownloadSpeed] =
    useState("");
  const [uploadSpeed, setUploadSpeed] =
    useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadNetwork() {
      if (permissionsLoading) {
        return;
      }

      if (isDemo || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const { data, error } =
          await loadNetworkInfoRows(
            supabase,
            householdId,
            user.id,
            householdOwnerId
          );

        if (error) {
          console.error(
            "Unable to load network profile:",
            error
          );
          return;
        }

        const row =
          (data ?? [])[0] as
            | Record<string, unknown>
            | undefined;

        if (!row) {
          return;
        }

        setId(String(row.id ?? ""));
        setIsp(String(row.isp ?? ""));
        setRouterModel(
          String(row.router_model ?? "")
        );
        setModemModel(
          String(row.modem_model ?? "")
        );
        setWifiName(
          String(row.wifi_name ?? "")
        );
        setWifiPasswordHint(
          String(
            row.wifi_password_hint ?? ""
          )
        );
        setGuestNetwork(
          String(row.guest_network ?? "")
        );
        setAdminUrl(
          String(row.admin_url ?? "")
        );
        setDownloadSpeed(
          row.speed_download != null
            ? String(row.speed_download)
            : ""
        );
        setUploadSpeed(
          row.speed_upload != null
            ? String(row.speed_upload)
            : ""
        );
        setNotes(String(row.notes ?? ""));
      } finally {
        setLoading(false);
      }
    }

    void loadNetwork();
  }, [
    user,
    isDemo,
    householdId,
    householdOwnerId,
    permissionsLoading,
  ]);

  async function saveNetwork() {
    if (isDemo) {
      alert(
        "Demo mode is read-only. Sign in to save network information."
      );
      return;
    }

    if (!user) {
      return;
    }

    if (!canEdit) {
      alert(
        "You do not have permission to edit network information."
      );
      return;
    }

    const payload = {
      isp,
      router_model: routerModel,
      modem_model: modemModel,
      wifi_name: wifiName,
      wifi_password_hint: wifiPasswordHint,
      guest_network: guestNetwork,
      admin_url: adminUrl,
      speed_download: downloadSpeed
        ? Number(downloadSpeed)
        : null,
      speed_upload: uploadSpeed
        ? Number(uploadSpeed)
        : null,
      notes,
    };

    let error;

    if (id) {
      const scopedUpdate =
        await applyHouseholdMutationScope(
          supabase
            .from("network_info")
            .update(payload)
            .eq("id", id)
            .select("id"),
          householdId,
          user.id
        );

      error = scopedUpdate.error;

      const updatedRows =
        scopedUpdate.data ?? [];

      if (
        !error &&
        updatedRows.length === 0 &&
        householdId
      ) {
        const legacyUpdate =
          await applyHouseholdMutationScope(
            supabase
              .from("network_info")
              .update(payload)
              .eq("id", id)
              .select("id"),
            null,
            householdOwnerId ?? user.id
          );

        error = legacyUpdate.error;
      }
    } else {
      ({ error } = await supabase
        .from("network_info")
        .insert(
          withHouseholdInsertFields(
            payload,
            householdId,
            user.id
          )
        ));
    }

    if (error) {
      console.error(
        "Unable to save network info:",
        error
      );
      alert(
        "Unable to save network information. Please try again."
      );
    } else {
      alert("Network information saved!");
      window.location.href = "/network";
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold text-text-primary">
        Home Network
      </h1>

      {loading && (
        <p className="mt-4 text-text-secondary">
          Loading network profile...
        </p>
      )}

      <div className="bg-white rounded-2xl shadow p-6 mt-8 max-w-3xl space-y-4">
        <input
          className="border rounded-xl p-3 w-full"
          placeholder="Internet Provider"
          value={isp}
          onChange={(e) =>
            setIsp(e.target.value)
          }
          disabled={!canEdit || isDemo}
        />

        <input
          className="border rounded-xl p-3 w-full"
          placeholder="Router Model"
          value={routerModel}
          onChange={(e) =>
            setRouterModel(e.target.value)
          }
          disabled={!canEdit || isDemo}
        />

        <input
          className="border rounded-xl p-3 w-full"
          placeholder="Modem Model"
          value={modemModel}
          onChange={(e) =>
            setModemModel(e.target.value)
          }
          disabled={!canEdit || isDemo}
        />

        <input
          className="border rounded-xl p-3 w-full"
          placeholder="Wi-Fi Name"
          value={wifiName}
          onChange={(e) =>
            setWifiName(e.target.value)
          }
          disabled={!canEdit || isDemo}
        />

        <input
          className="border rounded-xl p-3 w-full"
          placeholder="Wi-Fi Password Hint"
          value={wifiPasswordHint}
          onChange={(e) =>
            setWifiPasswordHint(
              e.target.value
            )
          }
          disabled={!canEdit || isDemo}
        />

        <input
          className="border rounded-xl p-3 w-full"
          placeholder="Guest Network"
          value={guestNetwork}
          onChange={(e) =>
            setGuestNetwork(e.target.value)
          }
          disabled={!canEdit || isDemo}
        />

        <input
          className="border rounded-xl p-3 w-full"
          placeholder="Router Admin URL"
          value={adminUrl}
          onChange={(e) =>
            setAdminUrl(e.target.value)
          }
          disabled={!canEdit || isDemo}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            className="border rounded-xl p-3"
            placeholder="Download Mbps"
            value={downloadSpeed}
            onChange={(e) =>
              setDownloadSpeed(
                e.target.value
              )
            }
            disabled={!canEdit || isDemo}
          />

          <input
            className="border rounded-xl p-3"
            placeholder="Upload Mbps"
            value={uploadSpeed}
            onChange={(e) =>
              setUploadSpeed(e.target.value)
            }
            disabled={!canEdit || isDemo}
          />
        </div>

        <textarea
          className="border rounded-xl p-3 w-full"
          rows={5}
          placeholder="Notes"
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
          disabled={!canEdit || isDemo}
        />

        <button
          onClick={saveNetwork}
          disabled={!canEdit || isDemo}
          className="bg-charcoal text-surface-card px-6 py-3 rounded-xl disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save Network
        </button>
      </div>
    </main>
  );
}
