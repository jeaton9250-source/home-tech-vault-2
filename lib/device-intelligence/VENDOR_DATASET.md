# Vendor OUI dataset for Device Intelligence v3

## Current status (Phase 3A)

Runtime uses a **reviewed seed map** in `vendorLookup.ts`
(`VENDOR_DATASET_VERSION = seed-2026-07-24`).

This seed is intentionally small and redistributable for development and tests.

## Adding a full MA-L / MA-M / MA-S dataset

1. Obtain data under a license that **permits redistribution**
   (IEEE Registration Authority purchase, or another approved source).
2. Convert to JSON: `{ "0017f2": "Apple, Inc.", ... }`
3. Save as `lib/device-intelligence/data/oui-full.json` (use Git LFS if large).
4. Load it from `SeedMacVendorProvider` / a new `FileMacVendorProvider`.
5. Bump `VENDOR_DATASET_VERSION` in `types.ts`.

## Rules

- Do **not** scrape OUI databases without permission.
- Do **not** perform remote lookups per scanned device during a LAN scan.
- Cache all lookups in memory.
- Private / locally administered MACs must never receive OUI vendor certainty.
