import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { readingMinutesFromArticle } from "@/lib/knowledge/articleHelpers";

const article = {
  "slug": "filing-claims-with-organized-records",
  "category": "warranties" as const,
  "title": "Filing Warranty Claims with Organized Records",
  "description": "A claim walkthrough: what support asks for, how to prepare, and how a clean device record shortens the process.",
  "publishedAt": "2026-05-09",
  "updatedAt": "2026-05-09",
  "heroCaption": "A claim walkthrough: what support asks for, how to prepare, and how a clean device record shortens the process.",
  "intro": [
    "A claim walkthrough: what support asks for, how to prepare, and how a clean device record shortens the process. Most homes only feel the gap when something breaks, goes missing, or a stranger on the phone asks for details nobody wrote down.",
    "You will leave with a practical way to handle this that fits a real household — short enough to keep, specific enough to use under stress.",
    "We will cover what to write down, where it should live, who can see it, and how to keep it current as gear and people change.",
    "Home Tech Vault is useful here because devices, documents, warranties, and household sharing can live in one place — so this stays a living habit instead of a weekend project that quietly expires."
  ],
  "sections": [
    {
      "id": "open-serial-receipt-and-symptoms-first",
      "heading": "Open serial receipt and symptoms first",
      "paragraphs": [
        "Get specific about “open serial receipt and symptoms first” using your rooms, people, and gear — not a generic internet checklist. Save proof of purchase the day it arrives, while email search still finds it. That sounds small until you are the person on the phone trying to remember it.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “open serial receipt and symptoms first” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "The first version of these warranty notes should be usable tonight, not impressive next year. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive."
      ]
    },
    {
      "id": "photograph-the-failure-when-useful",
      "heading": "Photograph the failure when useful",
      "paragraphs": [
        "Get specific about “photograph the failure when useful” using your rooms, people, and gear — not a generic internet checklist. Write coverage end dates even if you are optimistic you will remember. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “photograph the failure when useful” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "I used to overbuild systems for this. The ones that survived were shorter and lived where we already looked. That is the kind of detail that feels optional until the week you need it.",
        "When the house and the notes disagree, believe the house and fix the notes the same day."
      ]
    },
    {
      "id": "write-a-short-timeline",
      "heading": "Write a short timeline",
      "paragraphs": [
        "Get specific about “write a short timeline” using your rooms, people, and gear — not a generic internet checklist. Manufacturer versus store versus card benefit — pick which door you will try first. That sounds small until you are the person on the phone trying to remember it.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “write a short timeline” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "If only one person knows where the record is, you do not have a household system yet. Your future self will care more about clarity than completeness.",
        "Share the location of this record with one other adult so it is not trapped on a single laptop."
      ]
    },
    {
      "id": "know-where-to-file",
      "heading": "Know where to file",
      "paragraphs": [
        "Get specific about “know where to file” using your rooms, people, and gear — not a generic internet checklist. Extended plans need plan numbers beside the device, not in a forgotten PDF pile. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Keep notes short enough that you will open them again next month. If two adults share the house, name who updates this so it is not ambient guilt.",
        "When “know where to file” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "After holidays, moves, or a big purchase, schedule a twenty-minute catch-up before details evaporate. If it takes more than a minute to find, the system is still too scattered.",
        "Stop when it is useful. A short living note beats a long abandoned one."
      ]
    },
    {
      "id": "track-ticket-numbers",
      "heading": "Track ticket numbers",
      "paragraphs": [
        "Get specific about “track ticket numbers” using your rooms, people, and gear — not a generic internet checklist. Before you call about a claim, open serial, receipt, and symptom notes together. That sounds small until you are the person on the phone trying to remember it.",
        "When the house and your notes disagree, trust the house and fix the notes the same day. Leave blanks when you are unsure — a visible gap beats a confident wrong answer.",
        "When “track ticket numbers” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "When support asks for something you lack, add it immediately so the next call is shorter. Keep it next to the related device or document so you are not reconstructing it from a text thread later."
      ]
    },
    {
      "id": "share-access-with-the-claim-owner",
      "heading": "Share access with the claim owner",
      "paragraphs": [
        "Get specific about “share access with the claim owner” using your rooms, people, and gear — not a generic internet checklist. Gifts and hand-me-downs still deserve serials and whatever proof you can gather. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “share access with the claim owner” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "Trust the physical house over stale notes — then fix the notes the same day. That is the kind of detail that feels optional until the week you need it."
      ]
    },
    {
      "id": "close-the-loop-after-resolution",
      "heading": "Close the loop after resolution",
      "paragraphs": [
        "Get specific about “close the loop after resolution” using your rooms, people, and gear — not a generic internet checklist. When coverage expires, mark it expired; do not delete the history. That sounds small until you are the person on the phone trying to remember it.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “close the loop after resolution” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week."
      ]
    },
    {
      "id": "improve-the-packet-for-next-time",
      "heading": "Improve the packet for next time",
      "paragraphs": [
        "Get specific about “improve the packet for next time” using your rooms, people, and gear — not a generic internet checklist. Hang warranty notes on the device record so they are impossible to orphan. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “improve the packet for next time” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive."
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
    "file electronics warranty claim",
    "warranty claim checklist",
    "device support documentation"
  ],
  "readingMinutes": 7
} satisfies Omit<KnowledgeArticle, "readingMinutes"> & {
  readingMinutes: number;
};

article.readingMinutes = readingMinutesFromArticle(article);

export default article as KnowledgeArticle;
