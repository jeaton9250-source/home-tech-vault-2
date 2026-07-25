import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { readingMinutesFromArticle } from "@/lib/knowledge/articleHelpers";

const article = {
  "slug": "how-to-inventory-every-device-in-your-home",
  "category": "devices" as const,
  "title": "How to Inventory Every Device in Your Home",
  "description": "A practical system for listing laptops, TVs, appliances, and gadgets so you always know what you own and where it lives.",
  "publishedAt": "2026-03-02",
  "updatedAt": "2026-03-02",
  "heroCaption": "A practical system for listing laptops, TVs, appliances, and gadgets so you always know what you own and where it lives.",
  "intro": [
    "Most households discover they lack a device inventory during stress: a theft claim, a dead TV before guests arrive, or a roommate who cannot tell which charger is safe to borrow.",
    "Finish a practical inventory: what to count on pass one, which details matter, and how to keep the list alive after the first weekend of energy fades.",
    "You will set one source of truth, walk rooms in order, capture brand, model, serial, location, and owner, attach proofs, and connect the list to warranties and network notes.",
    "Home Tech Vault is useful here because devices, documents, warranties, and household sharing can live in one place — so this stays a living habit instead of a weekend project that quietly expires."
  ],
  "sections": [
    {
      "id": "decide-what-actually-counts",
      "heading": "Decide what actually counts",
      "paragraphs": [
        "Count powered and networked gear that costs real money to replace. Include smart appliances and mesh nodes even when they feel like fixtures. That sounds small until you are the person on the phone trying to remember it.",
        "Skip cheap cables on pass one unless unlabeled cords cause weekly friction. Ask whether model or serial would matter for warranty or insurance.",
        "The first version of these device notes should be usable tonight, not impressive next year. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive.",
        "Revisit “decide what actually counts” only to change what is true today — not to rebuild the whole section from scratch."
      ]
    },
    {
      "id": "pick-one-place-to-keep-the-list",
      "heading": "Pick one place to keep the list",
      "paragraphs": [
        "Choose a household vault instead of three spreadsheets and a chat photo album. Name who primarily edits so updates belong to someone. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Treat side notes as temporary staging, not competing systems. Make sure someone besides one locked laptop can reach the records.",
        "I used to overbuild systems for this. The ones that survived were shorter and lived where we already looked. That is the kind of detail that feels optional until the week you need it.",
        "When the house and the notes disagree, believe the house and fix the notes the same day.",
        "Revisit “pick one place to keep the list” only to change what is true today — not to rebuild the whole section from scratch."
      ]
    },
    {
      "id": "walk-the-house-in-a-fixed-order",
      "heading": "Walk the house in a fixed order",
      "paragraphs": [
        "Start at the router, then move room by room so you do not double-count. Open media cabinets and utility closets where remotes and spare nodes hide. That sounds small until you are the person on the phone trying to remember it.",
        "Inventory first and declutter second. If a room stalls, capture names and locations, then return later for serials.",
        "If only one person knows where the record is, you do not have a household system yet. Your future self will care more about clarity than completeness.",
        "Share the location of this record with one other adult so it is not trapped on a single laptop.",
        "Revisit “walk the house in a fixed order” only to change what is true today — not to rebuild the whole section from scratch."
      ]
    },
    {
      "id": "write-down-what-you-will-need-later",
      "heading": "Write down what you will need later",
      "paragraphs": [
        "Brand, model, serial or IMEI, room, and primary user cover most emergencies. Add purchase date and price while the receipt is still findable. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Record MAC addresses for devices you may whitelist later. Use a short note for quirks like required cable types.",
        "After holidays, moves, or a big purchase, schedule a twenty-minute catch-up before details evaporate. If it takes more than a minute to find, the system is still too scattered.",
        "Stop when it is useful. A short living note beats a long abandoned one.",
        "Revisit “write down what you will need later” only to change what is true today — not to rebuild the whole section from scratch."
      ]
    },
    {
      "id": "attach-paperwork-while-it-is-still-nearby",
      "heading": "Attach paperwork while it is still nearby",
      "paragraphs": [
        "Link order emails and PDF receipts the day you unbox. Photograph serial labels before mounting or hiding gear. That sounds small until you are the person on the phone trying to remember it.",
        "Scan paper warranty cards once, both sides. Keep warranty PDFs beside the device, not in a generic Downloads pile.",
        "When support asks for something you lack, add it immediately so the next call is shorter. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive.",
        "Revisit “attach paperwork while it is still nearby” only to change what is true today — not to rebuild the whole section from scratch."
      ]
    },
    {
      "id": "treat-shared-and-personal-gear-differently",
      "heading": "Treat shared and personal gear differently",
      "paragraphs": [
        "Shared living-room gear should be household-visible; phones can stay limited-access. Record who pays which cellular line on family plans. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Store parental control hints privately, not on sticky notes. Write down ownership decisions when they are ambiguous.",
        "Trust the physical house over stale notes — then fix the notes the same day. That is the kind of detail that feels optional until the week you need it.",
        "When the house and the notes disagree, believe the house and fix the notes the same day.",
        "Revisit “treat shared and personal gear differently” only to change what is true today — not to rebuild the whole section from scratch."
      ]
    },
    {
      "id": "keep-the-list-from-going-stale",
      "heading": "Keep the list from going stale",
      "paragraphs": [
        "Update on unbox, gift, sale, or move. Seasonally spot-check one room for ten minutes. That sounds small until you are the person on the phone trying to remember it.",
        "Retire devices with a status flag instead of deleting history. After holidays, schedule a catch-up for gifted gadgets.",
        "Share the location of this record with one other adult so it is not trapped on a single laptop.",
        "Revisit “keep the list from going stale” only to change what is true today — not to rebuild the whole section from scratch."
      ]
    },
    {
      "id": "use-the-list-when-it-counts",
      "heading": "Use the list when it counts",
      "paragraphs": [
        "Room photos with devices in context help insurance adjusters. Serials without purchase proof rarely satisfy claims. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Pull model and install date before a technician arrives. Keep a copy you can reach if the home network is offline.",
        "Stop when it is useful. A short living note beats a long abandoned one.",
        "Revisit “use the list when it counts” only to change what is true today — not to rebuild the whole section from scratch."
      ]
    }
  ],
  "faq": [
    {
      "question": "How perfect does this need to be?",
      "answer": "Good enough to act under stress. Skip fields you will not maintain."
    },
    {
      "question": "Where should the notes live?",
      "answer": "In one household place with clear permissions — not scattered across apps and chats."
    },
    {
      "question": "Who should edit?",
      "answer": "Name a primary editor, then give others view access as needed."
    },
    {
      "question": "What if details are missing?",
      "answer": "Mark them unknown and schedule a catch-up. Visible gaps beat false confidence."
    },
    {
      "question": "How often should we review?",
      "answer": "On unbox, gift, sale, move, and a short seasonal spot check."
    },
    {
      "question": "How does Home Tech Vault help?",
      "answer": "It keeps devices, documents, and household sharing together so habits stick."
    }
  ],
  "internalLinks": [
    {
      "href": "/device-inventory",
      "label": "Device inventory",
      "description": "Keep your living device list in one place."
    },
    {
      "href": "/warranty-tracker",
      "label": "Warranty tracker",
      "description": "Hang coverage dates on each device."
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
  "readingMinutes": 7
} satisfies Omit<KnowledgeArticle, "readingMinutes"> & {
  readingMinutes: number;
};

article.readingMinutes = readingMinutesFromArticle(article);

export default article as KnowledgeArticle;
