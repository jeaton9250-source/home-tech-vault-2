import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { readingMinutesFromArticle } from "@/lib/knowledge/articleHelpers";

const article = {
  "slug": "warranties-for-gifted-and-used-devices",
  "category": "warranties" as const,
  "title": "Warranties for Gifted and Used Devices",
  "description": "How to capture coverage when you did not buy the device yourself — gifts, hand-me-downs, and marketplace finds.",
  "publishedAt": "2026-05-13",
  "updatedAt": "2026-05-13",
  "heroCaption": "How to capture coverage when you did not buy the device yourself — gifts, hand-me-downs, and marketplace finds.",
  "intro": [
    "How to capture coverage when you did not buy the device yourself — gifts, hand-me-downs, and marketplace finds. Most homes only feel the gap when something breaks, goes missing, or a stranger on the phone asks for details nobody wrote down.",
    "You will leave with a practical way to handle this that fits a real household — short enough to keep, specific enough to use under stress.",
    "We will cover what to write down, where it should live, who can see it, and how to keep it current as gear and people change.",
    "Home Tech Vault is useful here because devices, documents, warranties, and household sharing can live in one place — so this stays a living habit instead of a weekend project that quietly expires."
  ],
  "sections": [
    {
      "id": "ask-for-serials-at-handoff",
      "heading": "Ask for serials at handoff",
      "paragraphs": [
        "Get specific about “ask for serials at handoff” using your rooms, people, and gear — not a generic internet checklist. Save proof of purchase the day it arrives, while email search still finds it. That sounds small until you are the person on the phone trying to remember it.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “ask for serials at handoff” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "The first version of these warranty notes should be usable tonight, not impressive next year. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive."
      ]
    },
    {
      "id": "save-whatever-proof-exists",
      "heading": "Save whatever proof exists",
      "paragraphs": [
        "Get specific about “save whatever proof exists” using your rooms, people, and gear — not a generic internet checklist. Write coverage end dates even if you are optimistic you will remember. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “save whatever proof exists” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "I used to overbuild systems for this. The ones that survived were shorter and lived where we already looked. That is the kind of detail that feels optional until the week you need it.",
        "When the house and the notes disagree, believe the house and fix the notes the same day."
      ]
    },
    {
      "id": "note-transfer-limitations",
      "heading": "Note transfer limitations",
      "paragraphs": [
        "Get specific about “note transfer limitations” using your rooms, people, and gear — not a generic internet checklist. Manufacturer versus store versus card benefit — pick which door you will try first. That sounds small until you are the person on the phone trying to remember it.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “note transfer limitations” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "If only one person knows where the record is, you do not have a household system yet. Your future self will care more about clarity than completeness.",
        "Share the location of this record with one other adult so it is not trapped on a single laptop."
      ]
    },
    {
      "id": "register-when-required",
      "heading": "Register when required",
      "paragraphs": [
        "Get specific about “register when required” using your rooms, people, and gear — not a generic internet checklist. Extended plans need plan numbers beside the device, not in a forgotten PDF pile. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Keep notes short enough that you will open them again next month. If two adults share the house, name who updates this so it is not ambient guilt.",
        "When “register when required” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "After holidays, moves, or a big purchase, schedule a twenty-minute catch-up before details evaporate. If it takes more than a minute to find, the system is still too scattered.",
        "Stop when it is useful. A short living note beats a long abandoned one."
      ]
    },
    {
      "id": "be-honest-about-unknowns",
      "heading": "Be honest about unknowns",
      "paragraphs": [
        "Get specific about “be honest about unknowns” using your rooms, people, and gear — not a generic internet checklist. Before you call about a claim, open serial, receipt, and symptom notes together. That sounds small until you are the person on the phone trying to remember it.",
        "When the house and your notes disagree, trust the house and fix the notes the same day. Leave blanks when you are unsure — a visible gap beats a confident wrong answer.",
        "When “be honest about unknowns” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "When support asks for something you lack, add it immediately so the next call is shorter. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive."
      ]
    },
    {
      "id": "create-a-fresh-inventory-entry",
      "heading": "Create a fresh inventory entry",
      "paragraphs": [
        "Get specific about “create a fresh inventory entry” using your rooms, people, and gear — not a generic internet checklist. Gifts and hand-me-downs still deserve serials and whatever proof you can gather. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “create a fresh inventory entry” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "Trust the physical house over stale notes — then fix the notes the same day. That is the kind of detail that feels optional until the week you need it."
      ]
    },
    {
      "id": "watch-return-windows",
      "heading": "Watch return windows",
      "paragraphs": [
        "Get specific about “watch return windows” using your rooms, people, and gear — not a generic internet checklist. When coverage expires, mark it expired; do not delete the history. That sounds small until you are the person on the phone trying to remember it.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “watch return windows” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week."
      ]
    },
    {
      "id": "avoid-assuming-coverage",
      "heading": "Avoid assuming coverage",
      "paragraphs": [
        "Get specific about “avoid assuming coverage” using your rooms, people, and gear — not a generic internet checklist. Hang warranty notes on the device record so they are impossible to orphan. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “avoid assuming coverage” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive."
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
      "href": "/warranty-tracker",
      "label": "Warranty tracker",
      "description": "Track coverage dates and documents."
    },
    {
      "href": "/device-inventory",
      "label": "Device inventory",
      "description": "Warranties belong on device records."
    },
    {
      "href": "/home-document-organizer",
      "label": "Document organizer",
      "description": "Keep receipts findable."
    }
  ],
  "keywords": [
    "used device warranty",
    "gift electronics warranty",
    "secondhand device documentation"
  ],
  "readingMinutes": 7
} satisfies Omit<KnowledgeArticle, "readingMinutes"> & {
  readingMinutes: number;
};

article.readingMinutes = readingMinutesFromArticle(article);

export default article as KnowledgeArticle;
