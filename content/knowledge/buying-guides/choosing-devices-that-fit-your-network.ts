import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { readingMinutesFromArticle } from "@/lib/knowledge/articleHelpers";

const article = {
  "slug": "choosing-devices-that-fit-your-network",
  "category": "buying-guides" as const,
  "title": "Choosing Devices That Fit Your Network",
  "description": "Wi-Fi standards, wired needs, guest isolation, and mesh quirks — buy gear that matches how your home actually connects.",
  "publishedAt": "2026-06-09",
  "updatedAt": "2026-06-09",
  "heroCaption": "Wi-Fi standards, wired needs, guest isolation, and mesh quirks — buy gear that matches how your home actually connects.",
  "intro": [
    "Wi-Fi standards, wired needs, guest isolation, and mesh quirks — buy gear that matches how your home actually connects. Most homes only feel the gap when something breaks, goes missing, or a stranger on the phone asks for details nobody wrote down.",
    "You will leave with a practical way to handle this that fits a real household — short enough to keep, specific enough to use under stress.",
    "We will cover what to write down, where it should live, who can see it, and how to keep it current as gear and people change.",
    "Home Tech Vault is useful here because devices, documents, warranties, and household sharing can live in one place — so this stays a living habit instead of a weekend project that quietly expires."
  ],
  "sections": [
    {
      "id": "document-your-mesh-quirks",
      "heading": "Document your mesh quirks",
      "paragraphs": [
        "Get specific about “document your mesh quirks” using your rooms, people, and gear — not a generic internet checklist. Measure the shelf and check the outlet before the product page talks you into it. That sounds small until you are the person on the phone trying to remember it.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “document your mesh quirks” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "The first version of these buying notes should be usable tonight, not impressive next year. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive."
      ]
    },
    {
      "id": "prefer-wired-when-reliability-matters",
      "heading": "Prefer wired when reliability matters",
      "paragraphs": [
        "Get specific about “prefer wired when reliability matters” using your rooms, people, and gear — not a generic internet checklist. Buy for the Wi-Fi and ports you have, not the ones in the marketing photo. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “prefer wired when reliability matters” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "I used to overbuild systems for this. The ones that survived were shorter and lived where we already looked. That is the kind of detail that feels optional until the week you need it.",
        "When the house and the notes disagree, believe the house and fix the notes the same day."
      ]
    },
    {
      "id": "check-band-and-standard-realities",
      "heading": "Check band and standard realities",
      "paragraphs": [
        "Get specific about “check band and standard realities” using your rooms, people, and gear — not a generic internet checklist. Write who will own the account and the warranty in a shared household. That sounds small until you are the person on the phone trying to remember it.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “check band and standard realities” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "If only one person knows where the record is, you do not have a household system yet. Your future self will care more about clarity than completeness.",
        "Share the location of this record with one other adult so it is not trapped on a single laptop."
      ]
    },
    {
      "id": "note-guest-network-needs",
      "heading": "Note guest-network needs",
      "paragraphs": [
        "Get specific about “note guest-network needs” using your rooms, people, and gear — not a generic internet checklist. If it is used or refurbished, verify reset status and serial before you pay. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Keep notes short enough that you will open them again next month. If two adults share the house, name who updates this so it is not ambient guilt.",
        "When “note guest-network needs” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "After holidays, moves, or a big purchase, schedule a twenty-minute catch-up before details evaporate. If it takes more than a minute to find, the system is still too scattered.",
        "Stop when it is useful. A short living note beats a long abandoned one."
      ]
    },
    {
      "id": "avoid-orphans-that-need-new-hubs",
      "heading": "Avoid orphans that need new hubs",
      "paragraphs": [
        "Get specific about “avoid orphans that need new hubs” using your rooms, people, and gear — not a generic internet checklist. Unbox into your records the same day — serials vanish with packaging. That sounds small until you are the person on the phone trying to remember it.",
        "When the house and your notes disagree, trust the house and fix the notes the same day. Leave blanks when you are unsure — a visible gap beats a confident wrong answer.",
        "When “avoid orphans that need new hubs” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "When support asks for something you lack, add it immediately so the next call is shorter. Keep it next to the related device or document so you are not reconstructing it from a text thread later."
      ]
    },
    {
      "id": "write-the-constraint-before-shopping",
      "heading": "Write the constraint before shopping",
      "paragraphs": [
        "Get specific about “write the constraint before shopping” using your rooms, people, and gear — not a generic internet checklist. Keep gift receipts and return windows where calm-you can find them. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “write the constraint before shopping” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "Trust the physical house over stale notes — then fix the notes the same day. That is the kind of detail that feels optional until the week you need it."
      ]
    },
    {
      "id": "retest-after-purchase",
      "heading": "Retest after purchase",
      "paragraphs": [
        "Get specific about “retest after purchase” using your rooms, people, and gear — not a generic internet checklist. Score options against real rooms and real people, not feature checklists alone. That sounds small until you are the person on the phone trying to remember it.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “retest after purchase” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week."
      ]
    },
    {
      "id": "update-network-docs-after-add",
      "heading": "Update network docs after add",
      "paragraphs": [
        "Get specific about “update network docs after add” using your rooms, people, and gear — not a generic internet checklist. For upgrade versus repair, write cost, remaining coverage, and household friction side by side. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “update network docs after add” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive."
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
      "href": "/home-tech-checklist",
      "label": "Home tech checklist",
      "description": "Capture constraints before you buy."
    },
    {
      "href": "/device-inventory",
      "label": "Device inventory",
      "description": "Add new gear the day it arrives."
    },
    {
      "href": "/network-documentation",
      "label": "Network documentation",
      "description": "Buy gear that fits your network."
    }
  ],
  "keywords": [
    "wifi compatible devices",
    "buy for home network",
    "mesh compatible gear"
  ],
  "readingMinutes": 7
} satisfies Omit<KnowledgeArticle, "readingMinutes"> & {
  readingMinutes: number;
};

article.readingMinutes = readingMinutesFromArticle(article);

export default article as KnowledgeArticle;
