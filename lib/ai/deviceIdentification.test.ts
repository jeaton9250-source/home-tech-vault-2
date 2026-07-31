import assert from "node:assert/strict";
import {
  describe,
  it,
} from "node:test";

import {
  buildAiDeviceHashes,
  shouldRequestAiIdentification,
} from "./deviceIdentification";

import type {
  IdentificationResult,
} from "@/lib/connector/deviceIdentification";

import type {
  ParsedDiscoveryDevice,
} from "@/lib/connector/discoveryValidation";

const device:
  ParsedDiscoveryDevice = {
    localFingerprint:
      "host:roku-bedroom|mac:aa-bb",

    ipAddress:
      "192.168.1.40",

    macAddress:
      "AA:BB:CC:DD:EE:FF",

    hostname:
      "roku-bedroom.local",

    manufacturer:
      "Roku",

    model: null,

    serialNumber:
      "PRIVATE-SERIAL",

    friendlyName: null,

    deviceType: null,

    discoverySources: [
      "mdns",
      "ssdp",
    ],

    mdnsServices: [
      "_roku-ecp._tcp",
    ],

    ssdpDeviceType:
      "urn:roku-com:device:player:1",

    ssdpDescriptionUrl:
      "http://192.168.1.40:8060/query/device-info",

    firstSeenAt:
      "2026-07-30T20:00:00.000Z",

    lastSeenAt:
      "2026-07-30T22:00:00.000Z",

    online: true,
  };

const unknown:
  IdentificationResult = {
    likelyCategory: null,
    likelyBrand: null,
    friendlyName: null,
    model: null,
    identificationConfidence:
      "unknown",
    identificationReasons: [
      "Insufficient evidence",
    ],
    displayName:
      "Unknown network device",
  };

describe(
  "AI device identification rules",
  () => {
    it(
      "requests AI for unidentified devices",
      () => {
        assert.equal(
          shouldRequestAiIdentification({
            deterministic:
              unknown,
            recognitionStatus:
              "pending",
            importedDeviceId:
              null,
          }),
          true
        );
      }
    );

    it(
      "does not request AI for accepted recognition",
      () => {
        assert.equal(
          shouldRequestAiIdentification({
            deterministic:
              unknown,
            recognitionStatus:
              "accepted",
            importedDeviceId:
              null,
          }),
          false
        );
      }
    );

    it(
      "does not request AI for linked vault devices",
      () => {
        assert.equal(
          shouldRequestAiIdentification({
            deterministic:
              unknown,
            recognitionStatus:
              "pending",
            importedDeviceId:
              "device-id",
          }),
          false
        );
      }
    );

    it(
      "hashes observations without exposing raw identifiers",
      () => {
        const hashes =
          buildAiDeviceHashes(
            device
          );

        assert.equal(
          hashes.fingerprintHash
            .length,
          64
        );

        assert.equal(
          hashes.observationHash
            .length,
          64
        );

        assert.equal(
          hashes.fingerprintHash
            .includes(
              device.macAddress ??
                ""
            ),
          false
        );

        assert.equal(
          hashes.observationHash
            .includes(
              device.ipAddress ??
                ""
            ),
          false
        );
      }
    );
  }
);
