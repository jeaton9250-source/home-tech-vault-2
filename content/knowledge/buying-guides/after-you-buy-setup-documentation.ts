import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { readingMinutesFromArticle } from "@/lib/knowledge/articleHelpers";

const article = {
  "slug": "after-you-buy-setup-documentation",
  "category": "buying-guides" as const,
  "title": "After You Buy: Setup Documentation That Sticks",
  "description": "Turn the first hour of ownership into lasting records: serials, accounts, warranty dates, and where the device lives.",
  "publishedAt": "2026-06-05",
  "updatedAt": "2026-06-05",
  "heroCaption": "Turn the first hour of ownership into lasting records: serials, accounts, warranty dates, and where the device lives.",
  "intro": [
    "Turn the first hour of ownership into lasting records: serials, accounts, warranty dates, and where the device lives. Most homes only feel the gap when something breaks, goes missing, or a stranger on the phone asks for details nobody wrote down.",
    "You will leave with a practical way to handle this that fits a real household — short enough to keep, specific enough to use under stress.",
    "We will cover what to write down, where it should live, who can see it, and how to keep it current as gear and people change.",
    "Home Tech Vault is useful here because devices, documents, warranties, and household sharing can live in one place — so this stays a living habit instead of a weekend project that quietly expires."
  ],
  "sections": [
    {
      "id": "create-the-device-record-on-day-one",
      "heading": "Create the device record on day one",
      "paragraphs": [
        "Get specific about “create the device record on day one” using your rooms, people, and gear — not a generic internet checklist. Measure the shelf and check the outlet before the product page talks you into it. That sounds small until you are the person on the phone trying to remember it.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “create the device record on day one” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "The first version of these buying notes should be usable tonight, not impressive next year. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive."
      ]
    },
    {
      "id": "save-serials-before-mounting",
      "heading": "Save serials before mounting",
      "paragraphs": [
        "Get specific about “save serials before mounting” using your rooms, people, and gear — not a generic internet checklist. Buy for the Wi-Fi and ports you have, not the ones in the marketing photo. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “save serials before mounting” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "I used to overbuild systems for this. The ones that survived were shorter and lived where we already looked. That is the kind of detail that feels optional until the week you need it.",
        "When the house and the notes disagree, believe the house and fix the notes the same day."
      ]
    },
    {
      "id": "note-setup-choices",
      "heading": "Note setup choices",
      "paragraphs": [
        "Get specific about “note setup choices” using your rooms, people, and gear — not a generic internet checklist. Write who will own the account and the warranty in a shared household. That sounds small until you are the person on the phone trying to remember it.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “note setup choices” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "If only one person knows where the record is, you do not have a household system yet. Your future self will care more about clarity than completeness.",
        "Share the location of this record with one other adult so it is not trapped on a single laptop."
      ]
    },
    {
      "id": "attach-receipts-immediately",
      "heading": "Attach receipts immediately",
      "paragraphs": [
        "Get specific about “attach receipts immediately” using your rooms, people, and gear — not a generic internet checklist. If it is used or refurbished, verify reset status and serial before you pay. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Keep notes short enough that you will open them again next month. If two adults share the house, name who updates this so it is not ambient guilt.",
        "When “attach receipts immediately” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "After holidays, moves, or a big purchase, schedule a twenty-minute catch-up before details evaporate. If it takes more than a minute to find, the system is still too scattered."
      ]
    },
    {
      "id": "write-wi-fi-and-account-links",
      "heading": "Write Wi-Fi and account links",
      "paragraphs": [
        "Get specific about “write Wi-Fi and account links” using your rooms, people, and gear — not a generic internet checklist. Unbox into your records the same day — serials vanish with packaging. That sounds small until you are the person on the phone trying to remember it.",
        "When the house and your notes disagree, trust the house and fix the notes the same day. Leave blanks when you are unsure — a visible gap beats a confident wrong answer.",
        "When “write Wi-Fi and account links” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "When support asks for something you lack, add it immediately so the next call is shorter. Keep it next to the related device or document so you are not reconstructing it from a text thread later."
      ]
    },
    {
      "id": "tell-the-household-where-it-lives",
      "heading": "Tell the household where it lives",
      "paragraphs": [
        "Get specific about “tell the household where it lives” using your rooms, people, and gear — not a generic internet checklist. Keep gift receipts and return windows where calm-you can find them. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “tell the household where it lives” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "Trust the physical house over stale notes — then fix the notes the same day. That is the kind of detail that feels optional until the week you need it."
      ]
    },
    {
      "id": "schedule-a-one-week-fix-pass",
      "heading": "Schedule a one-week fix pass",
      "paragraphs": [
        "Get specific about “schedule a one-week fix pass” using your rooms, people, and gear — not a generic internet checklist. Score options against real rooms and real people, not feature checklists alone. That sounds small until you are the person on the phone trying to remember it.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “schedule a one-week fix pass” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week."
      ]
    },
    {
      "id": "close-packaging-only-after-returns-clear",
      "heading": "Close packaging only after returns clear",
      "paragraphs": [
        "Get specific about “close packaging only after returns clear” using your rooms, people, and gear — not a generic internet checklist. For upgrade versus repair, write cost, remaining coverage, and household friction side by side. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “close packaging only after returns clear” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive."
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
    "new device setup checklist",
    "after purchase documentation",
    "electronics onboarding home"
  ],
  "readingMinutes": 7
} satisfies Omit<KnowledgeArticle, "readingMinutes"> & {
  readingMinutes: number;
};

article.readingMinutes = readingMinutesFromArticle(article);

export default article as KnowledgeArticle;
