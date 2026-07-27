import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveImportedDeviceName } from "./deviceEnrichment";

describe("resolveImportedDeviceName", () => {
  it("imports LivingRoomTV.lan as Living Room TV", () => {
    const name = resolveImportedDeviceName({
      hostname: "LivingRoomTV.lan",
    });

    assert.equal(name, "Living Room TV");
  });

  it("imports HP-OfficeJet.local as HP OfficeJet", () => {
    const name = resolveImportedDeviceName({
      hostname: "HP-OfficeJet.local",
    });

    assert.equal(name, "HP OfficeJet");
  });

  it("imports xbox-series-x.home.arpa as Xbox Series X", () => {
    const name = resolveImportedDeviceName({
      hostname: "xbox-series-x.home.arpa",
    });

    assert.equal(name, "Xbox Series X");
  });

  it("strips uppercase .LAN suffix", () => {
    const name = resolveImportedDeviceName({
      hostname: "BRAVIA-7F31.LAN",
    });

    assert.equal(name, "BRAVIA 7F31");
  });

  it("prioritizes accepted recognition name", () => {
    const name = resolveImportedDeviceName({
      recognitionStatus: "accepted",
      recognitionAcceptedName: "Family Room TV",
      friendlyName: "Living Room TV",
      identificationDisplayName: "Sony TV",
      hostname: "LivingRoomTV.lan",
      manufacturer: "Sony",
      category: "TV",
    });

    assert.equal(name, "Family Room TV");
  });

  it("does not overwrite a manually named existing vault device", () => {
    const name = resolveImportedDeviceName({
      recognitionStatus: "accepted",
      recognitionAcceptedName: "Auto Suggestion",
      hostname: "LivingRoomTV.lan",
      existingDeviceName: "Do Not Rename Me",
      allowRename: false,
    });

    assert.equal(name, "Do Not Rename Me");
  });

  it("can rename only when explicit rename acceptance is provided", () => {
    const name = resolveImportedDeviceName({
      recognitionStatus: "accepted",
      recognitionAcceptedName: "Approved Rename",
      hostname: "LivingRoomTV.lan",
      existingDeviceName: "Existing Manual Name",
      allowRename: true,
    });

    assert.equal(name, "Approved Rename");
  });

  it("does not mutate the raw discovered hostname", () => {
    const rawHostname = "LivingRoomTV.lan";
    const name = resolveImportedDeviceName({
      hostname: rawHostname,
    });

    assert.equal(name, "Living Room TV");
    assert.equal(rawHostname, "LivingRoomTV.lan");
  });
});
