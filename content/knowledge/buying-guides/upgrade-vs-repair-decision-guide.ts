import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { readingMinutesFromArticle } from "@/lib/knowledge/articleHelpers";

const article = {
  "slug": "upgrade-vs-repair-decision-guide",
  "category": "buying-guides" as const,
  "title": "Upgrade vs Repair: A Practical Decision Guide",
  "description": "Weigh repair cost, remaining warranty, security support, and household friction before you replace or revive a device.",
  "publishedAt": "2026-06-15",
  "updatedAt": "2026-06-15",
  "heroCaption": "Weigh repair cost, remaining warranty, security support, and household friction before you replace or revive a device.",
  "intro": [
    "Weigh repair cost, remaining warranty, security support, and household friction before you replace or revive a device. Most homes only feel the gap when something breaks, goes missing, or a stranger on the phone asks for details nobody wrote down.",
    "You will leave with a practical way to handle this that fits a real household — short enough to keep, specific enough to use under stress.",
    "We will cover what to write down, where it should live, who can see it, and how to keep it current as gear and people change.",
    "Home Tech Vault is useful here because devices, documents, warranties, and household sharing can live in one place — so this stays a living habit instead of a weekend project that quietly expires."
  ],
  "sections": [
    {
      "id": "write-repair-quote-versus-replacement-cost",
      "heading": "Write repair quote versus replacement cost",
      "paragraphs": [
        "Get specific about “write repair quote versus replacement cost” using your rooms, people, and gear — not a generic internet checklist. Measure the shelf and check the outlet before the product page talks you into it. That sounds small until you are the person on the phone trying to remember it.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “write repair quote versus replacement cost” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "The first version of these buying notes should be usable tonight, not impressive next year. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive."
      ]
    },
    {
      "id": "check-remaining-coverage",
      "heading": "Check remaining coverage",
      "paragraphs": [
        "Get specific about “check remaining coverage” using your rooms, people, and gear — not a generic internet checklist. Buy for the Wi-Fi and ports you have, not the ones in the marketing photo. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “check remaining coverage” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "I used to overbuild systems for this. The ones that survived were shorter and lived where we already looked. That is the kind of detail that feels optional until the week you need it.",
        "When the house and the notes disagree, believe the house and fix the notes the same day."
      ]
    },
    {
      "id": "note-household-friction-of-downtime",
      "heading": "Note household friction of downtime",
      "paragraphs": [
        "Get specific about “note household friction of downtime” using your rooms, people, and gear — not a generic internet checklist. Write who will own the account and the warranty in a shared household. That sounds small until you are the person on the phone trying to remember it.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “note household friction of downtime” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "If only one person knows where the record is, you do not have a household system yet. Your future self will care more about clarity than completeness.",
        "Share the location of this record with one other adult so it is not trapped on a single laptop."
      ]
    },
    {
      "id": "consider-security-update-status",
      "heading": "Consider security update status",
      "paragraphs": [
        "Get specific about “consider security update status” using your rooms, people, and gear — not a generic internet checklist. If it is used or refurbished, verify reset status and serial before you pay. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Keep notes short enough that you will open them again next month. If two adults share the house, name who updates this so it is not ambient guilt.",
        "When “consider security update status” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "After holidays, moves, or a big purchase, schedule a twenty-minute catch-up before details evaporate. If it takes more than a minute to find, the system is still too scattered.",
        "Stop when it is useful. A short living note beats a long abandoned one."
      ]
    },
    {
      "id": "document-data-backup-needs",
      "heading": "Document data backup needs",
      "paragraphs": [
        "Get specific about “document data backup needs” using your rooms, people, and gear — not a generic internet checklist. Unbox into your records the same day — serials vanish with packaging. That sounds small until you are the person on the phone trying to remember it.",
        "When the house and your notes disagree, trust the house and fix the notes the same day. Leave blanks when you are unsure — a visible gap beats a confident wrong answer.",
        "When “document data backup needs” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "When support asks for something you lack, add it immediately so the next call is shorter. Keep it next to the related device or document so you are not reconstructing it from a text thread later."
      ]
    },
    {
      "id": "make-the-call-explicit",
      "heading": "Make the call explicit",
      "paragraphs": [
        "Get specific about “make the call explicit” using your rooms, people, and gear — not a generic internet checklist. Keep gift receipts and return windows where calm-you can find them. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “make the call explicit” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "Trust the physical house over stale notes — then fix the notes the same day. That is the kind of detail that feels optional until the week you need it."
      ]
    },
    {
      "id": "retire-or-keep-with-a-status",
      "heading": "Retire or keep with a status",
      "paragraphs": [
        "Get specific about “retire or keep with a status” using your rooms, people, and gear — not a generic internet checklist. Score options against real rooms and real people, not feature checklists alone. That sounds small until you are the person on the phone trying to remember it.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “retire or keep with a status” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week."
      ]
    },
    {
      "id": "review-what-you-learned",
      "heading": "Review what you learned",
      "paragraphs": [
        "Get specific about “review what you learned” using your rooms, people, and gear — not a generic internet checklist. For upgrade versus repair, write cost, remaining coverage, and household friction side by side. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “review what you learned” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive."
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
    "repair or replace electronics",
    "upgrade vs repair guide",
    "device replacement decision"
  ],
  "readingMinutes": 7
} satisfies Omit<KnowledgeArticle, "readingMinutes"> & {
  readingMinutes: number;
};

article.readingMinutes = readingMinutesFromArticle(article);

export default article as KnowledgeArticle;
