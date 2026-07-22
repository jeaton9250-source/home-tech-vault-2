# Home Tech Vault — Information Architecture Blueprint

**Role:** Chief Product Officer / Principal UX Designer  
**Status:** Approved for implementation planning — wireframes complete, no production code yet  
**Date:** July 2026  
**Guiding philosophy:** *"Homeowners think in things and places."*

---

## Approval Record (July 2026)

The proposed architecture is **approved** with the following refinements:

| Decision | Resolution |
|----------|------------|
| Core philosophy | **Keep:** "Homeowners think in things and places." |
| Maintenance | **Keep capability**, but as a **section on each device profile** — not a standalone navigation destination. |
| Subscriptions | **Rename to Services** — covers streaming, cloud storage, security subscriptions, and software. |
| Insights | **Keep, rename to Home Insights** — future home for recommendations, reminders, and home health information. |
| Device Profile | **Single source of truth** for everything related to a device: receipts, manuals, warranties, photos, maintenance, network, notes. |
| Overview pages | Documents, Warranties, and Services help users **find information quickly**; detailed information **always resolves back to the relevant device**. |

**Wireframes:** High-fidelity interactive wireframes for Home Pulse, Devices, Device Profile, Documents Overview, and Warranties Overview — including complete navigation flow — live in:

[`morgan-ia-wireframes.canvas.tsx`](/Users/jasoneaton/.cursor/projects/Users-jasoneaton-home-tech-vault/canvases/morgan-ia-wireframes.canvas.tsx)

**Implementation gate:** Wireframe review → Phase 1 (Device Profile) → remaining phases. No production code until wireframes are signed off in design review.

---

## Executive Summary

Home Tech Vault today is organized like **software categories** (Devices, Documents, Warranties, Network, Reports). Homeowners think in **things and places** (the TV in the living room, the receipt in the drawer, the router in the closet).

This blueprint reframes the product from a multi-database admin tool into a **walkable digital home**: every object owns its information; overview pages exist only to find and act quickly; Home Pulse answers what matters now; the device profile is the authoritative record for each thing.

---

## 1. Current Architecture

### 1.1 Mental model vs. product model

| How homeowners think | How the app is organized today |
|----------------------|--------------------------------|
| "My Samsung TV" | Devices list → device detail → scattered sections + separate Documents / Warranties pages |
| "What's expiring?" | Warranties page (re-filtered device list) + dashboard alerts + insights + audit |
| "Where's the receipt?" | Documents vault OR device detail OR reports |
| "How's my home doing?" | Dashboard + Insights + Audit + Home Pulse cards + Notifications + Activity |
| "What's on my network?" | Network Overview + Discover + Edit + per-device network fields |

The product exposes **data domains**. Users must learn the domain map before they can use the vault naturally.

### 1.2 Navigation topology (authenticated app — today)

**Pattern:** Header-centric — no persistent sidebar. Seven top-level nav groups, six implemented as dropdowns.

```
Home Pulse (link)
├── Technology ▼
│   ├── Devices
│   ├── Rooms
│   ├── Warranties
│   └── Maintenance          ← standalone destination (to be removed from nav)
├── Digital Vault ▼
│   ├── Documents
│   ├── Upload Document
│   └── Subscriptions        ← to be renamed Services
├── Network ▼
├── Insights ▼               ← to be renamed Home Insights
├── Family ▼
└── More ▼
```

**Source:** `lib/navigation/config.ts`, `components/navigation/AppHeader.tsx`

---

## 2. Problems

### 2.1 Cognitive load

1. **Too many front doors** — 20+ vault routes reachable from nav; 6 dropdowns each hiding 3–5 destinations.  
2. **Too many clicks to understand one thing** — Device story split across detail scroll, warranties list, documents vault, network page, reports preview.  
3. **Duplicate health surfaces** — Home Pulse, Insights, Audit, and Notifications all express "what needs attention" with different framing.  
4. **Software vocabulary** — "Digital Vault," "Coverage Center," "Technology Care," "Vault Intelligence" — none match how people talk at home.  
5. **Maintenance as a destination** — Tasks belong to the things they maintain, not a separate software module.  
6. **Global search is device-only** — Receipts, warranties, rooms, and network are invisible to header search.  

### 2.2 The "six sections for one device" failure mode

Today, to fully understand one device a user may visit:

1. Device detail (info, photos, docs, timeline)  
2. Warranties page (status in context of all devices)  
3. Documents page (find orphaned files)  
4. Maintenance page (open tasks)  
5. Network discover (if imported)  
6. Reports preview (for insurance snapshot)  

**Expected home behavior:** Stand in front of the TV → see everything about the TV in one place.

---

## 3. Approved Architecture

### 3.1 Core shift

```
FROM:  Category → List → Detail → Maybe related pages
TO:    Home → Thing (device) OR Place (room) → Everything about it
       Overview pages = fast lenses that link back to the device
       Device Profile = single source of truth
```

### 3.2 Primary objects

| Object | User phrase | Owns |
|--------|-------------|------|
| **Home** | "My house" | Completeness, alerts, next action (Home Pulse) |
| **Device** | "My TV / laptop / router" | **All facts, protection, files, photos, maintenance, network, history, notes** |
| **Room** | "Living room" | Grouped devices + room-level context |
| **Household file** | "Insurance inventory" | Documents not tied to one device (still linkable to devices) |
| **Service** | "Netflix / iCloud / Ring Protect" | Home-level recurring services (Services overview) |

### 3.3 Approved navigation (flat, place-first)

**Tier 1 — Always visible (no dropdowns)**

| Label | Route | One purpose |
|-------|-------|-------------|
| Home Pulse | `/dashboard` | How complete is my vault? What needs attention? What should I do next? |
| Devices | `/devices` | Find any thing |
| Rooms | `/home` | Browse by place |
| Documents | `/documents` | Find any file fast — every row links to its device |
| Warranties | `/warranties` | See coverage status across home — every row links to device |
| Network | `/network` | See how the home connects |
| Export | `/reports` | Take home with you (insurance, move, inventory) |

**Tier 2 — Promoted secondary destinations**

| Label | Route | One purpose |
|-------|-------|-------------|
| Home Insights | `/insights` | Recommendations, reminders, home health (future growth surface) |
| Services | `/subscriptions` | Streaming, cloud, security, software subscriptions (route may stay; label changes) |

**Removed from navigation**

| Removed | New home |
|---------|----------|
| **Maintenance** (nav item) | **Maintenance section** on each Device Profile + attention items on Home Pulse |
| Technology ▼ dropdown | Flat links above |
| Digital Vault ▼ dropdown | Flat links above |
| Insights ▼ dropdown | Home Insights as direct link |
| Subscriptions (label) | Renamed **Services** |

**Tier 3 — Profile menu / Settings**

Family, Account, Notifications, Security, Settings, Billing, Contact, Audit (linked from Home Pulse completeness detail).

### 3.4 Information resolution rule

> **Overview pages help you find. Device profiles tell you everything.**

| Overview page | Shows | Tap any item → |
|---------------|-------|----------------|
| Documents | File name, type, device, room, date | Device Profile → Documents section |
| Warranties | Status bucket, days left, value | Device Profile → Protection section |
| Services | Service name, cost, renewal | Service detail (home-level); linked devices optional |
| Home Pulse attention | One-line issue | Device Profile → relevant section anchor |

---

## 4. Device Profile — Single Source of Truth

**Design rule:** Only Timeline (beyond recent events) and long Notes may collapse. Everything else visible on load.

```
┌─────────────────────────────────────────────┐
│ HERO                                        │
│ Large photo · Name · Room · Category        │
│ Protection badge (Protected / Expiring / …) │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ QUICK FACTS (always visible)                │
│ Brand · Model · Serial · Room               │
│ Purchase date · Purchase price · Est. value │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ PROTECTION (always visible)                 │
│ Warranty status · Expiration · Days left    │
│ Linked warranty document                    │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ DOCUMENTS (always visible)                  │
│ Receipt · Manual · Warranty PDF · …           │
│ Each row: name, type, date — tap to preview │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ PHOTOS (always visible)                     │
│ Thumbnail strip · tap to enlarge            │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ MAINTENANCE (always visible)                │
│ Last service · Next due · Task list         │
│ Log maintenance inline                      │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ NETWORK (always visible if applicable)      │
│ Online/offline · IP · Last seen · Router      │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ TIMELINE (recent visible; older collapsed)    │
│ Last 5 events · "Show full history"          │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ NOTES (preview visible; expand if long)     │
└─────────────────────────────────────────────┘
```

**Sticky header on scroll:** Device name + protection status + Edit.

**Anchor targets for overview deep links:** `#protection`, `#documents`, `#maintenance`, `#network`

---

## 5. Page Purposes (Approved)

| Page | Single purpose |
|------|----------------|
| **Home Pulse** | Vault completeness, needs attention (max 5), one next step; links to Home Insights for deeper recommendations |
| **Device profile** | Everything about this one thing — the authoritative record |
| **Documents overview** | Find a document fast; every row shows device + room → device profile |
| **Warranties overview** | Four buckets: Expiring, Expired, Missing, Protected → device profile |
| **Services overview** | Home-level recurring services (formerly Subscriptions) |
| **Home Insights** | Recommendations, reminders, home health trends (future) |
| **Network** | Home connectivity narrative — not a config table |
| **Export** | Insurance, warranty summary, full inventory |
| **Rooms** | Walk the house room by room |
| **Devices** | Search and filter all things |

---

## 6. Home Pulse — Three Modules Only

```
┌─────────────────────────────────────────────┐
│ 1. VAULT COMPLETENESS                       │
│    Ring + percentage + link to Home Insights│
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ 2. NEEDS ATTENTION                          │
│    Max 5 items · each links to device       │
│    profile section (protection, maintenance)│
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ 3. NEXT STEP                                │
│    Single recommended action · one CTA      │
└─────────────────────────────────────────────┘
```

Remove from Home Pulse: category grid duplicating nav, 4 quick actions, duplicate stat cards, deep audit stats.

---

## 7. Documents Overview

Every row surfaces:
- Document name and type (Receipt, Manual, Warranty, …)  
- **Device name + room** (primary link → device profile `#documents`)  
- Date added  
- Preview action  

Search + type filter + device filter. No buried metadata.

---

## 8. Warranties Overview

Four buckets immediately visible:

| Bucket | Shows | Resolves to |
|--------|-------|-------------|
| Expiring | Device, days left, value | Device `#protection` |
| Expired | Device, expired date | Device `#protection` |
| Missing | Device, prompt to add | Device `#protection` |
| Protected | Device, expiration | Device `#protection` |

Warranty detail lives on device; this page is a **calendar of attention**.

---

## 9. Services (formerly Subscriptions)

Rename throughout product copy and navigation. Covers:
- Streaming (Netflix, Disney+, etc.)  
- Cloud storage (iCloud, Google One)  
- Security subscriptions (Ring Protect, ADT)  
- Software (Adobe, Microsoft 365)  

Services are **home-level** — not per-device sections — but may reference linked devices where relevant.

Route may remain `/subscriptions` initially; label becomes **Services**.

---

## 10. Home Insights (formerly Insights)

Future home for:
- Personalized recommendations ("Add warranty for your washer")  
- Reminders (firmware updates, filter replacements)  
- Home health trends and completeness breakdown  

Home Pulse surfaces the **top 5 attention items**; Home Insights holds the **full picture**.

Audit log may link from Home Insights completeness detail (Tier 3).

---

## 11. Navigation Flow (Wireframe Reference)

```
                    ┌─────────────┐
                    │  Home Pulse │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌──────────────┐
    │  Devices   │  │ Home       │  │  Documents   │
    │            │  │ Insights   │  │  Overview    │
    └─────┬──────┘  └────────────┘  └──────┬───────┘
          │                                  │
          ▼                                  │
    ┌────────────────────────────────────────┴───┐
    │           DEVICE PROFILE                     │
    │  Hero · Facts · Protection · Documents ·     │
    │  Photos · Maintenance · Network · Timeline   │
    └──────────────────────────────────────────────┘
          ▲
          │
    ┌─────┴──────┐
    │ Warranties │
    │  Overview  │
    └────────────┘
```

See interactive wireframes for pixel-level layout and annotated navigation paths.

---

## 12. Migration Strategy

### 12.1 Principles

1. **URLs stay stable** where possible (`/devices/[id]`, `/warranties`, `/documents`, `/subscriptions`) — redesign is layout and nav, not route tree surgery.  
2. **Data model unchanged** — IA fix is presentation and navigation; no Supabase migration required for v1.  
3. **Feature flags** — ship new device layout and Home Pulse behind flags for internal/demo testing.  
4. **Wireframes first** — complete before Phase 1 code.

### 12.2 Phased rollout

| Phase | Scope | User impact |
|-------|-------|-------------|
| **0 — Blueprint + wireframes** | This document + interactive wireframes | None |
| **1 — Device profile** | Full scroll structure including Maintenance section | Highest value; proves single source of truth |
| **2 — Home Pulse** | Three-module layout; attention → device anchors | Daily use improvement |
| **3 — Navigation** | Flatten header; rename Subscriptions → Services, Insights → Home Insights; remove Maintenance from nav | Wayfinding improvement |
| **4 — Overview pages** | Documents, Warranties device attribution + deep links | Align lenses with new model |
| **5 — Home Insights + Services** | Rename, copy, layout refresh | Secondary destinations |
| **6 — Network + Export** | Narrative network view; export cards | Output and connectivity |
| **7 — Cleanup** | Merge Activity into Notifications; demote Audit | Reduce overlap |

---

## 13. Resolved Questions

| Question | Decision |
|----------|----------|
| Maintenance tasks | **Device section** + Home Pulse attention — not standalone nav |
| Subscriptions placement | **Renamed Services** — Tier 2 nav destination |
| Insights | **Renamed Home Insights** — recommendations, reminders, home health |
| Device as source of truth | **Yes** — overview pages are lenses only |
| Rename Reports → Export? | Nav label **Export**; page title may include subtitle |
| Room as first-class object? | Deferred — currently derived from device location string |

---

## 14. Open Questions (Remaining)

1. **Bottom nav on mobile?** — Flat top nav may not fit; tabs (Home · Devices · Rooms · Documents · More) vs hamburger.  
2. **Services detail page** — Single page with inline edit vs dedicated `/services/[id]` route.  
3. **Home Insights Pro gating** — Which recommendations are free vs Pro?

---

## 15. Success Metrics

| Metric | Target |
|--------|--------|
| Clicks to view full device story (info + warranty + docs + maintenance) | 1 page load (from 3–6 today) |
| Primary nav dropdowns | 0 (from 6) |
| Home Pulse modules above fold | 3 (from 8+) |
| Maintenance nav visits | 0 — all via device profile |
| Support questions: "where do I upload…" | Decrease after Phase 1 |

---

## Appendix A — Approved Nav Map

| Path | Tier | Label | Notes |
|------|------|-------|-------|
| `/dashboard` | 1 | Home Pulse | Three modules |
| `/devices` | 1 | Devices | Unchanged route |
| `/home` | 1 | Rooms | Unchanged route |
| `/documents` | 1 | Documents | Overview lens → device |
| `/warranties` | 1 | Warranties | Overview lens → device |
| `/network` | 1 | Network | Home view |
| `/reports` | 1 | Export | Insurance, warranty, inventory |
| `/insights` | 2 | Home Insights | Renamed |
| `/subscriptions` | 2 | Services | Renamed |
| `/maintenance` | — | *(removed from nav)* | Lives on device profile |
| `/family` | 3 | Family | Profile menu |
| `/account`, `/settings` | 3 | Account | Merged hub |
| `/audit` | 3 | Vault health | Linked from Home Insights |

---

## Appendix B — Wireframe Deliverables

| Screen | Status | Notes |
|--------|--------|-------|
| Home Pulse | Wireframed | Completeness, attention, next step |
| Devices | Wireframed | Search, filters, room chips, device cards |
| Device Profile | Wireframed | All sections including Maintenance |
| Documents Overview | Wireframed | Device attribution on every row |
| Warranties Overview | Wireframed | Four buckets, device deep links |
| Navigation flow | Wireframed | Annotated paths between screens |

Interactive wireframes: [`morgan-ia-wireframes.canvas.tsx`](/Users/jasoneaton/.cursor/projects/Users-jasoneaton-home-tech-vault/canvases/morgan-ia-wireframes.canvas.tsx)

---

*Approved architecture. Wireframes complete. No production code until Phase 1 kickoff.*
