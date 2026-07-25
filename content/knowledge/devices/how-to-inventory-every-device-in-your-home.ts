import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { readingMinutesFromArticle } from "@/lib/knowledge/articleHelpers";

const article = {
  "slug": "how-to-inventory-every-device-in-your-home",
  "category": "devices" as const,
  "title": "How to Inventory Every Device in Your Home",
  "description": "A practical system for listing laptops, TVs, appliances, and gadgets so you always know what you own and where it lives.",
  "publishedAt": "2026-03-02",
  "updatedAt": "2026-03-02",
  "heroCaption": "Placeholder hero: checklist beside laptops, remotes, and a router.",
  "intro": [
    "Most households discover they lack a device inventory during stress: a theft claim, a dead TV before guests arrive, or a roommate who cannot tell which charger is safe to borrow.",
    "Finish a practical inventory: what to count on pass one, which fields matter, and how to keep the list alive after the first weekend of energy fades.",
    "Set one source of truth, walk rooms in order, capture brand/model/serial/location/owner, attach proofs, and connect the list to warranties and network notes.",
    "Home Tech Vault fits this guide because devices, documents, warranties, and household sharing can live together \u2014 so these habits become a living system instead of a weekend project that expires."
  ],
  "sections": [
    {
      "id": "decide-what-counts-as-a-device",
      "heading": "Decide what counts as a device",
      "paragraphs": [
        "Count powered and networked gear that costs real money to replace. Include smart appliances and mesh nodes even when they feel like fixtures. Update the same day the physical gear or policy changes. Even if a vendor app stores \u201cdecide what counts as a device\u201d, keep a household-facing summary where the right people can find it.",
        "Skip cheap cables on pass one unless unlabeled cords cause weekly friction. Ask whether model or serial would matter for warranty or insurance. If two adults share the house, name the primary editor. Even if a vendor app stores \u201cdecide what counts as a device\u201d, keep a household-facing summary where the right people can find it.",
        "Tag employer or school devices so claims stay clean. Treat camera kits as linked records so accessories are not orphaned. Tag retired items instead of deleting history you may need later. Even if a vendor app stores \u201cdecide what counts as a device\u201d, keep a household-facing summary where the right people can find it.",
        "Add one house-specific example under Decide what counts as a device. If nothing changed since last review still write the review date. Keep notes short enough that you will maintain them next month. For secrets related to \u201cdecide what counts as a device\u201d, use a password manager and store only pointers in shared records."
      ]
    },
    {
      "id": "choose-one-source-of-truth",
      "heading": "Choose one source of truth",
      "paragraphs": [
        "Pick a household vault instead of three spreadsheets and a chat album. Name a primary editor so updates belong to someone. If two adults share the house, name the primary editor. For secrets related to \u201cchoose one source of truth\u201d, use a password manager and store only pointers in shared records.",
        "Treat side notes as temporary staging not competing systems. Export a snapshot after major purchases for insurance. Tag retired items instead of deleting history you may need later. For secrets related to \u201cchoose one source of truth\u201d, use a password manager and store only pointers in shared records.",
        "Ensure someone besides one locked laptop can reach the records. Migrate binder pages that still hold unique info then stop dual systems. Attach the habit to something you already do \u2014 bill pay, filter changes, or seasonal cleaning. For secrets related to \u201cchoose one source of truth\u201d, use a password manager and store only pointers in shared records.",
        "Add one house-specific example under Choose one source of truth. If nothing changed since last review still write the review date. Keep notes short enough that you will maintain them next month. For secrets related to \u201cchoose one source of truth\u201d, use a password manager and store only pointers in shared records."
      ]
    },
    {
      "id": "walk-the-house-in-a-fixed-order",
      "heading": "Walk the house in a fixed order",
      "paragraphs": [
        "Start at the router then move room by room to avoid double-counting. Open media cabinets and utility closets where remotes and spare nodes hide. Tag retired items instead of deleting history you may need later. Photograph labels for \u201cwalk the house in a fixed order\u201d only when characters are tiny; file the photo beside typed fields.",
        "Inventory first and declutter second. Carry a phone for label photos and a laptop for typing fields. Attach the habit to something you already do \u2014 bill pay, filter changes, or seasonal cleaning. Photograph labels for \u201cwalk the house in a fixed order\u201d only when characters are tiny; file the photo beside typed fields.",
        "If a room stalls capture names and locations then return later for serials. Mark rooms done until the digital list matches what you saw. Update the same day the physical gear or policy changes. Photograph labels for \u201cwalk the house in a fixed order\u201d only when characters are tiny; file the photo beside typed fields.",
        "Add one house-specific example under Walk the house in a fixed order. If nothing changed since last review still write the review date. Keep notes short enough that you will maintain them next month. For secrets related to \u201cwalk the house in a fixed order\u201d, use a password manager and store only pointers in shared records."
      ]
    },
    {
      "id": "capture-the-minimum-fields-that-matter",
      "heading": "Capture the minimum fields that matter",
      "paragraphs": [
        "Brand model serial or IMEI room and primary user cover most emergencies. Add purchase date and price while the receipt is findable. Attach the habit to something you already do \u2014 bill pay, filter changes, or seasonal cleaning. Close the loop on \u201ccapture the minimum fields that matter\u201d by naming the next action and the person responsible.",
        "Record MAC addresses for devices you may whitelist later. Use a short note for quirks like required cable types. Update the same day the physical gear or policy changes. Close the loop on \u201ccapture the minimum fields that matter\u201d by naming the next action and the person responsible.",
        "For phones store IMEI and the account that controls device finding. For TVs and consoles note HDMI assignments if you rewire often. If two adults share the house, name the primary editor. Close the loop on \u201ccapture the minimum fields that matter\u201d by naming the next action and the person responsible.",
        "Add one house-specific example under Capture the minimum fields that matter. If nothing changed since last review still write the review date. Keep notes short enough that you will maintain them next month. For secrets related to \u201ccapture the minimum fields that matter\u201d, use a password manager and store only pointers in shared records."
      ]
    },
    {
      "id": "attach-documents-while-they-are-still-nearby",
      "heading": "Attach documents while they are still nearby",
      "paragraphs": [
        "Link order emails and PDF receipts the day you unbox. Photograph serial labels before mounting or hiding gear. Update the same day the physical gear or policy changes. Write \u201cattach documents while they are still nearby\u201d as if a house guest with average tech confidence had to use it tonight.",
        "Scan paper warranty cards once on both sides. Store manual URLs with version dates if you skip full PDFs. If two adults share the house, name the primary editor. Write \u201cattach documents while they are still nearby\u201d as if a house guest with average tech confidence had to use it tonight.",
        "Note proof pending when a document is missing so the gap stays visible. Keep warranty PDFs beside the device not in a generic Downloads pile. Tag retired items instead of deleting history you may need later. Write \u201cattach documents while they are still nearby\u201d as if a house guest with average tech confidence had to use it tonight.",
        "Add one house-specific example under Attach documents while they are still nearby. If nothing changed since last review still write the review date. Keep notes short enough that you will maintain them next month. For secrets related to \u201cattach documents while they are still nearby\u201d, use a password manager and store only pointers in shared records."
      ]
    },
    {
      "id": "handle-shared-and-personal-devices-differently",
      "heading": "Handle shared and personal devices differently",
      "paragraphs": [
        "Shared living-room gear should be household-visible while phones can stay limited-access. Record who pays which cellular line on family plans. If two adults share the house, name the primary editor. Stale notes for \u201chandle shared and personal devices differently\u201d create false confidence \u2014 worse than marking a field unknown.",
        "Store parental control hints privately not on sticky notes. Guest laptops that visit weekly do not belong in the permanent inventory. Tag retired items instead of deleting history you may need later. Stale notes for \u201chandle shared and personal devices differently\u201d create false confidence \u2014 worse than marking a field unknown.",
        "Work devices should list the employer IT contact for loss instructions. Write down ownership decisions when they are ambiguous. Attach the habit to something you already do \u2014 bill pay, filter changes, or seasonal cleaning. Stale notes for \u201chandle shared and personal devices differently\u201d create false confidence \u2014 worse than marking a field unknown.",
        "Add one house-specific example under Handle shared and personal devices differently. If nothing changed since last review still write the review date. Keep notes short enough that you will maintain them next month. For secrets related to \u201chandle shared and personal devices differently\u201d, use a password manager and store only pointers in shared records."
      ]
    },
    {
      "id": "keep-the-inventory-from-rotting",
      "heading": "Keep the inventory from rotting",
      "paragraphs": [
        "Update on unbox gift sale or move. Seasonally spot-check one room for ten minutes. Tag retired items instead of deleting history you may need later. Even if a vendor app stores \u201ckeep the inventory from rotting\u201d, keep a household-facing summary where the right people can find it.",
        "Retire devices with a status flag instead of deleting history. When a device leaves note destination and whether data was wiped. Attach the habit to something you already do \u2014 bill pay, filter changes, or seasonal cleaning. Even if a vendor app stores \u201ckeep the inventory from rotting\u201d, keep a household-facing summary where the right people can find it.",
        "After holidays schedule a catch-up for gifted gadgets. If backlog grows freeze new purchases until records catch up. Update the same day the physical gear or policy changes. Even if a vendor app stores \u201ckeep the inventory from rotting\u201d, keep a household-facing summary where the right people can find it.",
        "Add one house-specific example under Keep the inventory from rotting. If nothing changed since last review still write the review date. Keep notes short enough that you will maintain them next month. For secrets related to \u201ckeep the inventory from rotting\u201d, use a password manager and store only pointers in shared records."
      ]
    },
    {
      "id": "use-the-list-for-insurance-and-service",
      "heading": "Use the list for insurance and service",
      "paragraphs": [
        "Room photos with devices in context help adjusters. Serials without purchase proof rarely satisfy claims. Attach the habit to something you already do \u2014 bill pay, filter changes, or seasonal cleaning. For secrets related to \u201cuse the list for insurance and service\u201d, use a password manager and store only pointers in shared records.",
        "Export a dated snapshot after buying expensive gear. Share read-only access with whoever handles claims paperwork. Update the same day the physical gear or policy changes. For secrets related to \u201cuse the list for insurance and service\u201d, use a password manager and store only pointers in shared records.",
        "Pull model and install date before a technician arrives. Keep an offsite-accessible copy if disaster risk is in scope. If two adults share the house, name the primary editor. For secrets related to \u201cuse the list for insurance and service\u201d, use a password manager and store only pointers in shared records.",
        "Add one house-specific example under Use the list for insurance and service. If nothing changed since last review still write the review date. Keep notes short enough that you will maintain them next month. For secrets related to \u201cuse the list for insurance and service\u201d, use a password manager and store only pointers in shared records."
      ]
    },
    {
      "id": "connect-inventory-to-network-and-warranty-notes",
      "heading": "Connect inventory to network and warranty notes",
      "paragraphs": [
        "Routers belong in both device inventory and network docs. Warranty end dates should be visible on the device record. Update the same day the physical gear or policy changes. Photograph labels for \u201cconnect inventory to network and warranty notes\u201d only when characters are tiny; file the photo beside typed fields.",
        "Hubs need a depends-on list of bulbs and sensors. When replacing gear transfer documents and close the old record. If two adults share the house, name the primary editor. Photograph labels for \u201cconnect inventory to network and warranty notes\u201d only when characters are tiny; file the photo beside typed fields.",
        "ISP modem identifiers should match outage-call notes. Hang maintenance logs for filters or firmware on the same entry. Tag retired items instead of deleting history you may need later. Photograph labels for \u201cconnect inventory to network and warranty notes\u201d only when characters are tiny; file the photo beside typed fields.",
        "Add one house-specific example under Connect inventory to network and warranty notes. If nothing changed since last review still write the review date. Keep notes short enough that you will maintain them next month. For secrets related to \u201cconnect inventory to network and warranty notes\u201d, use a password manager and store only pointers in shared records."
      ]
    },
    {
      "id": "finish-pass-one-in-a-single-weekend",
      "heading": "Finish pass one in a single weekend",
      "paragraphs": [
        "Prioritize expensive and networked gear over perfect completeness. Set a timer per room to keep momentum. If two adults share the house, name the primary editor. Close the loop on \u201cfinish pass one in a single weekend\u201d by naming the next action and the person responsible.",
        "Ship a good-enough v1 then schedule deferred serials. Tell everyone where the list lives so parallel trackers die. Tag retired items instead of deleting history you may need later. Close the loop on \u201cfinish pass one in a single weekend\u201d by naming the next action and the person responsible.",
        "Celebrate finished rooms not perfect fields. Book the next seasonal review before you close the laptop. Attach the habit to something you already do \u2014 bill pay, filter changes, or seasonal cleaning. Close the loop on \u201cfinish pass one in a single weekend\u201d by naming the next action and the person responsible.",
        "Add one house-specific example under Finish pass one in a single weekend. If nothing changed since last review still write the review date. Keep notes short enough that you will maintain them next month. For secrets related to \u201cfinish pass one in a single weekend\u201d, use a password manager and store only pointers in shared records."
      ]
    }
  ],
  "faq": [
    {
      "question": "Do I need every USB cable?",
      "answer": "Not on pass one. Focus on costly, networked, or warrantied devices."
    },
    {
      "question": "What if the serial is missing?",
      "answer": "Mark serial unknown, photograph labels, and check boxes or order email."
    },
    {
      "question": "Should renters inventory too?",
      "answer": "Yes. Renters still file claims, move often, and share gear."
    },
    {
      "question": "How detailed should location be?",
      "answer": "Room plus a short placement note is enough."
    },
    {
      "question": "Is a spreadsheet enough?",
      "answer": "It can start the project, but documents and permissions outgrow sheets."
    },
    {
      "question": "How does Home Tech Vault help?",
      "answer": "It keeps devices, documents, and warranty dates together with household sharing."
    }
  ],
  "internalLinks": [
    {
      "href": "/knowledge/devices/room-by-room-device-audit",
      "label": "Room By Room Device Audit",
      "description": "Continue with this related Knowledge Center guide."
    },
    {
      "href": "/knowledge/devices/what-to-record-when-you-unbox-a-device",
      "label": "What To Record When You Unbox A Device",
      "description": "Continue with this related Knowledge Center guide."
    },
    {
      "href": "/device-inventory",
      "label": "Device inventory",
      "description": "Build a living device list in Home Tech Vault."
    },
    {
      "href": "/warranty-tracker",
      "label": "Warranty tracker",
      "description": "Attach coverage dates to each device."
    },
    {
      "href": "/home-tech-inventory",
      "label": "Home tech inventory",
      "description": "See the broader inventory approach."
    }
  ],
  "keywords": [
    "home device inventory",
    "electronics list",
    "household tech catalog"
  ],
  "readingMinutes": 11
} satisfies Omit<KnowledgeArticle, "readingMinutes"> & {
  readingMinutes: number;
};

article.readingMinutes = readingMinutesFromArticle(article);

export default article as KnowledgeArticle;
