import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { readingMinutesFromArticle } from "@/lib/knowledge/articleHelpers";

const article = {
  "slug": "what-to-record-when-you-unbox-a-device",
  "category": "devices" as const,
  "title": "What to Record When You Unbox a Device",
  "description": "A short unboxing checklist that captures receipts, serials, and setup notes while everything is still in one place.",
  "publishedAt": "2026-03-14",
  "updatedAt": "2026-03-14",
  "heroCaption": "A short unboxing checklist that captures receipts, serials, and setup notes while everything is still in one place.",
  "intro": [
    "A short unboxing checklist that captures receipts, serials, and setup notes while everything is still in one place. Most homes only feel the gap when something breaks, goes missing, or a stranger on the phone asks for details nobody wrote down.",
    "You will leave with a practical way to handle this that fits a real household — short enough to keep, specific enough to use under stress.",
    "We will cover what to write down, where it should live, who can see it, and how to keep it current as gear and people change.",
    "Home Tech Vault is useful here because devices, documents, warranties, and household sharing can live in one place — so this stays a living habit instead of a weekend project that quietly expires."
  ],
  "sections": [
    {
      "id": "do-it-while-everything-is-still-on-the-table",
      "heading": "Do it while everything is still on the table",
      "paragraphs": [
        "Get specific about “do it while everything is still on the table” using your rooms, people, and gear — not a generic internet checklist. Walk to the device and write what you see — not what you remember from last year. That sounds small until you are the person on the phone trying to remember it.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “do it while everything is still on the table” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "The first version of these device notes should be usable tonight, not impressive next year. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive."
      ]
    },
    {
      "id": "save-receipt-and-order-number-first",
      "heading": "Save receipt and order number first",
      "paragraphs": [
        "Get specific about “save receipt and order number first” using your rooms, people, and gear — not a generic internet checklist. If two chargers look identical, add a one-line note that prevents the weekly argument. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “save receipt and order number first” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "I used to overbuild systems for this. The ones that survived were shorter and lived where we already looked. That is the kind of detail that feels optional until the week you need it."
      ]
    },
    {
      "id": "photograph-serials-before-mounting",
      "heading": "Photograph serials before mounting",
      "paragraphs": [
        "Get specific about “photograph serials before mounting” using your rooms, people, and gear — not a generic internet checklist. Room plus a short placement note is enough; you are not drafting architecture plans. That sounds small until you are the person on the phone trying to remember it.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “photograph serials before mounting” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "If only one person knows where the record is, you do not have a household system yet. Your future self will care more about clarity than completeness."
      ]
    },
    {
      "id": "write-setup-choices-you-will-forget",
      "heading": "Write setup choices you will forget",
      "paragraphs": [
        "Get specific about “write setup choices you will forget” using your rooms, people, and gear — not a generic internet checklist. When a device is employer-owned, say so so insurance claims stay clean. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Keep notes short enough that you will open them again next month. If two adults share the house, name who updates this so it is not ambient guilt.",
        "When “write setup choices you will forget” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "After holidays, moves, or a big purchase, schedule a twenty-minute catch-up before details evaporate. If it takes more than a minute to find, the system is still too scattered."
      ]
    },
    {
      "id": "create-the-inventory-entry-immediately",
      "heading": "Create the inventory entry immediately",
      "paragraphs": [
        "Get specific about “create the inventory entry immediately” using your rooms, people, and gear — not a generic internet checklist. Unbox into the inventory while the receipt is still in the shopping tab. That sounds small until you are the person on the phone trying to remember it.",
        "When the house and your notes disagree, trust the house and fix the notes the same day. Leave blanks when you are unsure — a visible gap beats a confident wrong answer.",
        "When “create the inventory entry immediately” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "When support asks for something you lack, add it immediately so the next call is shorter. Keep it next to the related device or document so you are not reconstructing it from a text thread later."
      ]
    },
    {
      "id": "store-packaging-only-if-returns-need-it",
      "heading": "Store packaging only if returns need it",
      "paragraphs": [
        "Get specific about “store packaging only if returns need it” using your rooms, people, and gear — not a generic internet checklist. Personal phones can stay limited-access; living-room gear should be household-visible. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “store packaging only if returns need it” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "Trust the physical house over stale notes — then fix the notes the same day. That is the kind of detail that feels optional until the week you need it."
      ]
    },
    {
      "id": "invite-the-household-owner-into-the-record",
      "heading": "Invite the household owner into the record",
      "paragraphs": [
        "Get specific about “invite the household owner into the record” using your rooms, people, and gear — not a generic internet checklist. Retire sold or recycled devices with a status instead of pretending they still live here. That sounds small until you are the person on the phone trying to remember it.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “invite the household owner into the record” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week."
      ]
    },
    {
      "id": "close-the-loop-the-same-day",
      "heading": "Close the loop the same day",
      "paragraphs": [
        "Get specific about “close the loop the same day” using your rooms, people, and gear — not a generic internet checklist. Before a technician arrives, pull model, serial, and install date into one screen. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “close the loop the same day” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive."
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
    "unboxing checklist",
    "new device setup records",
    "electronics documentation"
  ],
  "readingMinutes": 7
} satisfies Omit<KnowledgeArticle, "readingMinutes"> & {
  readingMinutes: number;
};

article.readingMinutes = readingMinutesFromArticle(article);

export default article as KnowledgeArticle;
