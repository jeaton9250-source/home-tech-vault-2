import {
  buildNewDeviceImportPayload,
  guessDiscoveryCategory,
  resolveImportedDeviceName,
} from "@/lib/connector/deviceEnrichment";
import {
  isDuplicateImportCandidate,
  matchDiscoveredDevice,
  rowToDiscoveredForMatching,
  rowToVaultDeviceForMatching,
} from "@/lib/connector/matching";
import {
  householdAccessResponse,
  requireHouseholdMutator,
} from "@/lib/connector/requireHouseholdAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

import type {
  DiscoveredDeviceRow,
  DuplicateImportWarning,
} from "@/lib/connector/discoveryTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ImportBody = {
  householdId?: string;
  force?: boolean;
};

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;
    const body =
      (await request.json()) as ImportBody;

    const memberContext =
      await requireHouseholdMutator(
        body.householdId
      );

    const admin = createAdminClient();
    const nowIso = new Date().toISOString();

    const { data: discoveredRow, error: discoveredError } =
      await admin
        .from("discovered_devices")
        .select("*")
        .eq("id", id)
        .eq(
          "household_id",
          memberContext.householdId
        )
        .maybeSingle();

    if (discoveredError) {
      throw discoveredError;
    }

    if (!discoveredRow) {
      return NextResponse.json(
        { error: "Discovered device not found." },
        { status: 404 }
      );
    }

    const row =
      discoveredRow as DiscoveredDeviceRow;

    if (row.imported_device_id) {
      return NextResponse.json(
        {
          error:
            "This discovered device is already linked to a vault device.",
          linkedDeviceId:
            row.imported_device_id,
        },
        { status: 409 }
      );
    }

    const { data: vaultRows, error: vaultError } =
      await admin
        .from("devices")
        .select(
          "id, household_id, device_name, brand, manufacturer, model_number, serial_number, mac_address, network_fingerprint, category, ip_address, hostname, first_seen_at, discovery_source"
        )
        .eq(
          "household_id",
          memberContext.householdId
        );

    if (vaultError) {
      throw vaultError;
    }

    const vaultDevices = (vaultRows ?? []).map(
      rowToVaultDeviceForMatching
    );

    const match = matchDiscoveredDevice(
      rowToDiscoveredForMatching(row),
      vaultDevices
    );

    const duplicateWarnings: DuplicateImportWarning[] =
      [];

    if (isDuplicateImportCandidate(match)) {
      const candidateIds =
        match.candidateDeviceIds ??
        (match.matchedDeviceId
          ? [match.matchedDeviceId]
          : []);

      for (const candidateId of candidateIds) {
        const candidate = vaultDevices.find(
          (device) =>
            device.id === candidateId
        );

        if (!candidate) {
          continue;
        }

        duplicateWarnings.push({
          deviceId: candidate.id,
          deviceName: candidate.deviceName,
          reason:
            match.matchReason ??
            "Possible duplicate device",
          confidence:
            match.matchConfidence ?? "high",
        });
      }

      if (
        !body.force &&
        duplicateWarnings.length > 0
      ) {
        return NextResponse.json(
          {
            error:
              "Possible duplicate devices were found. Confirm the match or import with force=true.",
            duplicateWarnings,
            match,
          },
          { status: 409 }
        );
      }
    }

    const discoveryFields = {
      ipAddress:
        row.ip_address === null
          ? null
          : String(row.ip_address),
      macAddress: row.mac_address,
      hostname: row.hostname,
      manufacturer: row.manufacturer,
      model: row.model,
      online: row.online,
      firstSeenAt: row.first_seen_at,
      lastSeenAt: row.last_seen_at,
      discoverySource:
        row.discovery_sources?.[0] ??
        "Connector Scan",
      connectorId: row.connector_id,
      networkFingerprint:
        row.local_fingerprint,
    };

    const importedName =
      resolveImportedDeviceName({
        recognitionStatus:
          row.recognition_status,
        recognitionAcceptedName:
          row.recognition_accepted_name,
        friendlyName: row.friendly_name,
        identificationDisplayName:
          row.identification_display_name,
        hostname: row.hostname,
        manufacturer:
          row.recognition_accepted_manufacturer ??
          row.manufacturer,
        category:
          row.recognition_accepted_category ??
          row.likely_category ??
          row.device_type,
      });

    const insertPayload =
      buildNewDeviceImportPayload({
        discovery: discoveryFields,
        deviceName: importedName,
        category: guessDiscoveryCategory(
          row.hostname,
          row.manufacturer,
          row.device_type
        ),
        householdId:
          memberContext.householdId,
        userId: memberContext.userId,
      });

    const { data: insertedDevice, error: insertError } =
      await admin
        .from("devices")
        .insert(insertPayload)
        .select("id")
        .single();

    if (insertError) {
      if (
        insertError.message.includes(
          "DEVICE_LIMIT_REACHED"
        )
      ) {
        return NextResponse.json(
          {
            error: "DEVICE_LIMIT_REACHED",
          },
          { status: 403 }
        );
      }

      throw insertError;
    }

    const { error: linkError } = await admin
      .from("discovered_devices")
      .update({
        imported_device_id:
          insertedDevice.id,
        match_confirmed_at: nowIso,
        match_confirmed_by:
          memberContext.userId,
        ignored_at: null,
        updated_at: nowIso,
      })
      .eq("id", id)
      .eq(
        "household_id",
        memberContext.householdId
      );

    if (linkError) {
      throw linkError;
    }

    return NextResponse.json({
      ok: true,
      deviceId: insertedDevice.id,
      duplicateWarnings,
    });
  } catch (error) {
    const accessResponse =
      householdAccessResponse(error);

    if (accessResponse) {
      return NextResponse.json(
        { error: accessResponse.message },
        { status: accessResponse.status }
      );
    }

    console.error(
      "Discovery import error:",
      error instanceof Error
        ? error.message
        : error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
