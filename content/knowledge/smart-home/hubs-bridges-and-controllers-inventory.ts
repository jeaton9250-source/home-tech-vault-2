import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { readingMinutesFromArticle } from "@/lib/knowledge/articleHelpers";

const article = {
  "slug": "hubs-bridges-and-controllers-inventory",
  "category": "smart-home" as const,
  "title": "Hubs, Bridges, and Controllers: What to Inventory",
  "description": "Capture the brains of your smart home — hubs, bridges, and controllers — so replacements and migrations are less painful.",
  "publishedAt": "2026-04-03",
  "updatedAt": "2026-04-03",
  "heroCaption": "Capture the brains of your smart home — hubs, bridges, and controllers — so replacements and migrations are less painful.",
  "intro": [
    "Capture the brains of your smart home — hubs, bridges, and controllers — so replacements and migrations are less painful. Most homes only feel the gap when something breaks, goes missing, or a stranger on the phone asks for details nobody wrote down.",
    "You will leave with a practical way to handle this that fits a real household — short enough to keep, specific enough to use under stress.",
    "We will cover what to write down, where it should live, who can see it, and how to keep it current as gear and people change.",
    "Home Tech Vault is useful here because devices, documents, warranties, and household sharing can live in one place — so this stays a living habit instead of a weekend project that quietly expires."
  ],
  "sections": [
    {
      "id": "list-every-hub-and-bridge",
      "heading": "List every hub and bridge",
      "paragraphs": [
        "Get specific about “list every hub and bridge” using your rooms, people, and gear — not a generic internet checklist. List hubs and bridges before bulbs — the brain of the house fails first in your memory. That sounds small until you are the person on the phone trying to remember it.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “list every hub and bridge” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "The first version of these smart home notes should be usable tonight, not impressive next year. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive."
      ]
    },
    {
      "id": "note-which-radios-and-protocols",
      "heading": "Note which radios and protocols",
      "paragraphs": [
        "Get specific about “note which radios and protocols” using your rooms, people, and gear — not a generic internet checklist. Name devices the way people yell them across the room. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “note which radios and protocols” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "I used to overbuild systems for this. The ones that survived were shorter and lived where we already looked. That is the kind of detail that feels optional until the week you need it.",
        "When the house and the notes disagree, believe the house and fix the notes the same day."
      ]
    },
    {
      "id": "write-account-and-backup-paths",
      "heading": "Write account and backup paths",
      "paragraphs": [
        "Get specific about “write account and backup paths” using your rooms, people, and gear — not a generic internet checklist. Write which email owns the account that can factory-reset the thing. That sounds small until you are the person on the phone trying to remember it.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “write account and backup paths” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "If only one person knows where the record is, you do not have a household system yet. Your future self will care more about clarity than completeness.",
        "Share the location of this record with one other adult so it is not trapped on a single laptop."
      ]
    },
    {
      "id": "map-what-depends-on-each-hub",
      "heading": "Map what depends on each hub",
      "paragraphs": [
        "Get specific about “map what depends on each hub” using your rooms, people, and gear — not a generic internet checklist. If a scene needs three devices, say that in one plain sentence. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Keep notes short enough that you will open them again next month. If two adults share the house, name who updates this so it is not ambient guilt.",
        "When “map what depends on each hub” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "After holidays, moves, or a big purchase, schedule a twenty-minute catch-up before details evaporate. If it takes more than a minute to find, the system is still too scattered."
      ]
    },
    {
      "id": "prepare-for-a-hub-death-day",
      "heading": "Prepare for a hub death day",
      "paragraphs": [
        "Get specific about “prepare for a hub death day” using your rooms, people, and gear — not a generic internet checklist. Battery sensors die quietly; inventory them before they chirp at 2 a.m. That sounds small until you are the person on the phone trying to remember it.",
        "When the house and your notes disagree, trust the house and fix the notes the same day. Leave blanks when you are unsure — a visible gap beats a confident wrong answer.",
        "When “prepare for a hub death day” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "When support asks for something you lack, add it immediately so the next call is shorter. Keep it next to the related device or document so you are not reconstructing it from a text thread later."
      ]
    },
    {
      "id": "keep-firmware-dates-light",
      "heading": "Keep firmware dates light",
      "paragraphs": [
        "Get specific about “keep firmware dates light” using your rooms, people, and gear — not a generic internet checklist. Voice speakers need room names and account ownership, not just cute nicknames. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “keep firmware dates light” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "Trust the physical house over stale notes — then fix the notes the same day. That is the kind of detail that feels optional until the week you need it."
      ]
    },
    {
      "id": "share-reset-knowledge-carefully",
      "heading": "Share reset knowledge carefully",
      "paragraphs": [
        "Get specific about “share reset knowledge carefully” using your rooms, people, and gear — not a generic internet checklist. When you rebuild automations after an app outage, keep a short offline note of the important ones. That sounds small until you are the person on the phone trying to remember it.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “share reset knowledge carefully” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week."
      ]
    },
    {
      "id": "retire-old-controllers-cleanly",
      "heading": "Retire old controllers cleanly",
      "paragraphs": [
        "Get specific about “retire old controllers cleanly” using your rooms, people, and gear — not a generic internet checklist. Retire abandoned bulbs and dead automations so the list matches reality. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “retire old controllers cleanly” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive."
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
      "href": "/smart-home-organizer",
      "label": "Smart home organizer",
      "description": "Organize connected gear above vendor apps."
    },
    {
      "href": "/device-inventory",
      "label": "Device inventory",
      "description": "Inventory hubs, sensors, and speakers."
    },
    {
      "href": "/network-documentation",
      "label": "Network documentation",
      "description": "Smart homes still need clear network notes."
    }
  ],
  "keywords": [
    "smart home hub inventory",
    "zigbee bridge records",
    "home assistant documentation"
  ],
  "readingMinutes": 7
} satisfies Omit<KnowledgeArticle, "readingMinutes"> & {
  readingMinutes: number;
};

article.readingMinutes = readingMinutesFromArticle(article);

export default article as KnowledgeArticle;
