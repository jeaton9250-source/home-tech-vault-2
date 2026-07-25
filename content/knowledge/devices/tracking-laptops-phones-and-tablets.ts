import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { readingMinutesFromArticle } from "@/lib/knowledge/articleHelpers";

const article = {
  "slug": "tracking-laptops-phones-and-tablets",
  "category": "devices" as const,
  "title": "Tracking Laptops, Phones, and Tablets at Home",
  "description": "Keep personal devices documented across family members without turning your household into an IT help desk.",
  "publishedAt": "2026-03-10",
  "updatedAt": "2026-03-10",
  "heroCaption": "Keep personal devices documented across family members without turning your household into an IT help desk.",
  "intro": [
    "Keep personal devices documented across family members without turning your household into an IT help desk. Most homes only feel the gap when something breaks, goes missing, or a stranger on the phone asks for details nobody wrote down.",
    "You will leave with a practical way to handle this that fits a real household — short enough to keep, specific enough to use under stress.",
    "We will cover what to write down, where it should live, who can see it, and how to keep it current as gear and people change.",
    "Home Tech Vault is useful here because devices, documents, warranties, and household sharing can live in one place — so this stays a living habit instead of a weekend project that quietly expires."
  ],
  "sections": [
    {
      "id": "list-people-and-their-primary-devices",
      "heading": "List people and their primary devices",
      "paragraphs": [
        "Get specific about “list people and their primary devices” using your rooms, people, and gear — not a generic internet checklist. Walk to the device and write what you see — not what you remember from last year. That sounds small until you are the person on the phone trying to remember it.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “list people and their primary devices” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "The first version of these device notes should be usable tonight, not impressive next year. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive."
      ]
    },
    {
      "id": "capture-imei-and-find-my-accounts",
      "heading": "Capture IMEI and find-my accounts",
      "paragraphs": [
        "Get specific about “capture IMEI and find-my accounts” using your rooms, people, and gear — not a generic internet checklist. If two chargers look identical, add a one-line note that prevents the weekly argument. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “capture IMEI and find-my accounts” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "I used to overbuild systems for this. The ones that survived were shorter and lived where we already looked. That is the kind of detail that feels optional until the week you need it.",
        "When the house and the notes disagree, believe the house and fix the notes the same day."
      ]
    },
    {
      "id": "note-who-pays-which-line",
      "heading": "Note who pays which line",
      "paragraphs": [
        "Get specific about “note who pays which line” using your rooms, people, and gear — not a generic internet checklist. Room plus a short placement note is enough; you are not drafting architecture plans. That sounds small until you are the person on the phone trying to remember it.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “note who pays which line” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "If only one person knows where the record is, you do not have a household system yet. Your future self will care more about clarity than completeness.",
        "Share the location of this record with one other adult so it is not trapped on a single laptop."
      ]
    },
    {
      "id": "handle-school-and-work-devices",
      "heading": "Handle school and work devices",
      "paragraphs": [
        "Get specific about “handle school and work devices” using your rooms, people, and gear — not a generic internet checklist. When a device is employer-owned, say so so insurance claims stay clean. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Keep notes short enough that you will open them again next month. If two adults share the house, name who updates this so it is not ambient guilt.",
        "When “handle school and work devices” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "After holidays, moves, or a big purchase, schedule a twenty-minute catch-up before details evaporate. If it takes more than a minute to find, the system is still too scattered."
      ]
    },
    {
      "id": "share-just-enough-with-the-household",
      "heading": "Share just enough with the household",
      "paragraphs": [
        "Get specific about “share just enough with the household” using your rooms, people, and gear — not a generic internet checklist. Unbox into the inventory while the receipt is still in the shopping tab. That sounds small until you are the person on the phone trying to remember it.",
        "When the house and your notes disagree, trust the house and fix the notes the same day. Leave blanks when you are unsure — a visible gap beats a confident wrong answer.",
        "When “share just enough with the household” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "When support asks for something you lack, add it immediately so the next call is shorter. Keep it next to the related device or document so you are not reconstructing it from a text thread later."
      ]
    },
    {
      "id": "plan-for-travel-and-loss",
      "heading": "Plan for travel and loss",
      "paragraphs": [
        "Get specific about “plan for travel and loss” using your rooms, people, and gear — not a generic internet checklist. Personal phones can stay limited-access; living-room gear should be household-visible. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “plan for travel and loss” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "Trust the physical house over stale notes — then fix the notes the same day. That is the kind of detail that feels optional until the week you need it."
      ]
    },
    {
      "id": "retire-old-phones-cleanly",
      "heading": "Retire old phones cleanly",
      "paragraphs": [
        "Get specific about “retire old phones cleanly” using your rooms, people, and gear — not a generic internet checklist. Retire sold or recycled devices with a status instead of pretending they still live here. That sounds small until you are the person on the phone trying to remember it.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “retire old phones cleanly” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week."
      ]
    },
    {
      "id": "review-after-back-to-school-and-holidays",
      "heading": "Review after back-to-school and holidays",
      "paragraphs": [
        "Get specific about “review after back-to-school and holidays” using your rooms, people, and gear — not a generic internet checklist. Before a technician arrives, pull model, serial, and install date into one screen. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “review after back-to-school and holidays” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive."
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
    "track family devices",
    "laptop inventory home",
    "phone serial number list"
  ],
  "readingMinutes": 7
} satisfies Omit<KnowledgeArticle, "readingMinutes"> & {
  readingMinutes: number;
};

article.readingMinutes = readingMinutesFromArticle(article);

export default article as KnowledgeArticle;
