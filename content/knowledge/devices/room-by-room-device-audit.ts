import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { readingMinutesFromArticle } from "@/lib/knowledge/articleHelpers";

const article = {
  "slug": "room-by-room-device-audit",
  "category": "devices" as const,
  "title": "Room-by-Room Device Audit for Busy Households",
  "description": "Walk each room once, capture what matters, and leave with a complete inventory instead of another abandoned spreadsheet.",
  "publishedAt": "2026-03-06",
  "updatedAt": "2026-03-06",
  "heroCaption": "Walk each room once, capture what matters, and leave with a complete inventory instead of another abandoned spreadsheet.",
  "intro": [
    "Walk each room once, capture what matters, and leave with a complete inventory instead of another abandoned spreadsheet. Most homes only feel the gap when something breaks, goes missing, or a stranger on the phone asks for details nobody wrote down.",
    "You will leave with a practical way to handle this that fits a real household — short enough to keep, specific enough to use under stress.",
    "We will cover what to write down, where it should live, who can see it, and how to keep it current as gear and people change.",
    "Home Tech Vault is useful here because devices, documents, warranties, and household sharing can live in one place — so this stays a living habit instead of a weekend project that quietly expires."
  ],
  "sections": [
    {
      "id": "pick-an-order-you-will-finish",
      "heading": "Pick an order you will finish",
      "paragraphs": [
        "Get specific about “pick an order you will finish” using your rooms, people, and gear — not a generic internet checklist. Walk to the device and write what you see — not what you remember from last year. That sounds small until you are the person on the phone trying to remember it.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “pick an order you will finish” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "The first version of these device notes should be usable tonight, not impressive next year. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive."
      ]
    },
    {
      "id": "capture-only-what-matters-in-each-room",
      "heading": "Capture only what matters in each room",
      "paragraphs": [
        "Get specific about “capture only what matters in each room” using your rooms, people, and gear — not a generic internet checklist. If two chargers look identical, add a one-line note that prevents the weekly argument. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “capture only what matters in each room” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "I used to overbuild systems for this. The ones that survived were shorter and lived where we already looked. That is the kind of detail that feels optional until the week you need it.",
        "When the house and the notes disagree, believe the house and fix the notes the same day."
      ]
    },
    {
      "id": "open-cabinets-and-closets-you-usually-skip",
      "heading": "Open cabinets and closets you usually skip",
      "paragraphs": [
        "Get specific about “open cabinets and closets you usually skip” using your rooms, people, and gear — not a generic internet checklist. Room plus a short placement note is enough; you are not drafting architecture plans. That sounds small until you are the person on the phone trying to remember it.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “open cabinets and closets you usually skip” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "If only one person knows where the record is, you do not have a household system yet. Your future self will care more about clarity than completeness."
      ]
    },
    {
      "id": "park-unknowns-without-losing-them",
      "heading": "Park unknowns without losing them",
      "paragraphs": [
        "Get specific about “park unknowns without losing them” using your rooms, people, and gear — not a generic internet checklist. When a device is employer-owned, say so so insurance claims stay clean. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Keep notes short enough that you will open them again next month. If two adults share the house, name who updates this so it is not ambient guilt.",
        "When “park unknowns without losing them” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "After holidays, moves, or a big purchase, schedule a twenty-minute catch-up before details evaporate. If it takes more than a minute to find, the system is still too scattered."
      ]
    },
    {
      "id": "handle-shared-rooms-without-debate",
      "heading": "Handle shared rooms without debate",
      "paragraphs": [
        "Get specific about “handle shared rooms without debate” using your rooms, people, and gear — not a generic internet checklist. Unbox into the inventory while the receipt is still in the shopping tab. That sounds small until you are the person on the phone trying to remember it.",
        "When the house and your notes disagree, trust the house and fix the notes the same day. Leave blanks when you are unsure — a visible gap beats a confident wrong answer.",
        "When “handle shared rooms without debate” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "When support asks for something you lack, add it immediately so the next call is shorter. Keep it next to the related device or document so you are not reconstructing it from a text thread later."
      ]
    },
    {
      "id": "stop-at-good-enough",
      "heading": "Stop at good enough",
      "paragraphs": [
        "Get specific about “stop at good enough” using your rooms, people, and gear — not a generic internet checklist. Personal phones can stay limited-access; living-room gear should be household-visible. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “stop at good enough” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "Trust the physical house over stale notes — then fix the notes the same day. That is the kind of detail that feels optional until the week you need it."
      ]
    },
    {
      "id": "close-the-room-before-you-leave",
      "heading": "Close the room before you leave",
      "paragraphs": [
        "Get specific about “close the room before you leave” using your rooms, people, and gear — not a generic internet checklist. Retire sold or recycled devices with a status instead of pretending they still live here. That sounds small until you are the person on the phone trying to remember it.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “close the room before you leave” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week."
      ]
    },
    {
      "id": "turn-the-walk-into-a-living-list",
      "heading": "Turn the walk into a living list",
      "paragraphs": [
        "Get specific about “turn the walk into a living list” using your rooms, people, and gear — not a generic internet checklist. Before a technician arrives, pull model, serial, and install date into one screen. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “turn the walk into a living list” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive."
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
    "room device audit",
    "home electronics audit",
    "inventory by room"
  ],
  "readingMinutes": 7
} satisfies Omit<KnowledgeArticle, "readingMinutes"> & {
  readingMinutes: number;
};

article.readingMinutes = readingMinutesFromArticle(article);

export default article as KnowledgeArticle;
