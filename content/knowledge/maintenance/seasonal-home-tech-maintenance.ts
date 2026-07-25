import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { readingMinutesFromArticle } from "@/lib/knowledge/articleHelpers";

const article = {
  "slug": "seasonal-home-tech-maintenance",
  "category": "maintenance" as const,
  "title": "Seasonal Home Tech Maintenance Checklist",
  "description": "Spring and fall tech checkups: filters, outdoor gear, backups, and the small tasks that prevent summer and winter surprises.",
  "publishedAt": "2026-05-15",
  "updatedAt": "2026-05-15",
  "heroCaption": "Spring and fall tech checkups: filters, outdoor gear, backups, and the small tasks that prevent summer and winter surprises.",
  "intro": [
    "Spring and fall tech checkups: filters, outdoor gear, backups, and the small tasks that prevent summer and winter surprises. Most homes only feel the gap when something breaks, goes missing, or a stranger on the phone asks for details nobody wrote down.",
    "You will leave with a practical way to handle this that fits a real household — short enough to keep, specific enough to use under stress.",
    "We will cover what to write down, where it should live, who can see it, and how to keep it current as gear and people change.",
    "Home Tech Vault is useful here because devices, documents, warranties, and household sharing can live in one place — so this stays a living habit instead of a weekend project that quietly expires."
  ],
  "sections": [
    {
      "id": "pick-spring-and-fall-anchors",
      "heading": "Pick spring and fall anchors",
      "paragraphs": [
        "Get specific about “pick spring and fall anchors” using your rooms, people, and gear — not a generic internet checklist. Attach the chore to a real device so it is not floating on a sticky note forever. That sounds small until you are the person on the phone trying to remember it.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “pick spring and fall anchors” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "The first version of these maintenance notes should be usable tonight, not impressive next year. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive."
      ]
    },
    {
      "id": "walk-outdoor-tech-and-vents",
      "heading": "Walk outdoor tech and vents",
      "paragraphs": [
        "Get specific about “walk outdoor tech and vents” using your rooms, people, and gear — not a generic internet checklist. Two sentences in a log help the next person more than a perfect spreadsheet. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “walk outdoor tech and vents” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "I used to overbuild systems for this. The ones that survived were shorter and lived where we already looked. That is the kind of detail that feels optional until the week you need it.",
        "When the house and the notes disagree, believe the house and fix the notes the same day."
      ]
    },
    {
      "id": "check-batteries-before-extremes",
      "heading": "Check batteries before extremes",
      "paragraphs": [
        "Get specific about “check batteries before extremes” using your rooms, people, and gear — not a generic internet checklist. Replace remote batteries on a rhythm, not when something dies mid-movie. That sounds small until you are the person on the phone trying to remember it.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “check batteries before extremes” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "If only one person knows where the record is, you do not have a household system yet. Your future self will care more about clarity than completeness.",
        "Share the location of this record with one other adult so it is not trapped on a single laptop."
      ]
    },
    {
      "id": "update-firmware-in-batches",
      "heading": "Update firmware in batches",
      "paragraphs": [
        "Get specific about “update firmware in batches” using your rooms, people, and gear — not a generic internet checklist. Firmware updates go smoother when you note the last good date. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Keep notes short enough that you will open them again next month. If two adults share the house, name who updates this so it is not ambient guilt.",
        "When “update firmware in batches” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "After holidays, moves, or a big purchase, schedule a twenty-minute catch-up before details evaporate. If it takes more than a minute to find, the system is still too scattered.",
        "Stop when it is useful. A short living note beats a long abandoned one."
      ]
    },
    {
      "id": "spot-check-one-room-each-season",
      "heading": "Spot-check one room each season",
      "paragraphs": [
        "Get specific about “spot-check one room each season” using your rooms, people, and gear — not a generic internet checklist. Clean lightly and safely — heroic methods brick more gear than dust does. That sounds small until you are the person on the phone trying to remember it.",
        "When the house and your notes disagree, trust the house and fix the notes the same day. Leave blanks when you are unsure — a visible gap beats a confident wrong answer.",
        "When “spot-check one room each season” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "When support asks for something you lack, add it immediately so the next call is shorter. Keep it next to the related device or document so you are not reconstructing it from a text thread later."
      ]
    },
    {
      "id": "log-what-you-skipped",
      "heading": "Log what you skipped",
      "paragraphs": [
        "Get specific about “log what you skipped” using your rooms, people, and gear — not a generic internet checklist. HVAC and console vents clog quietly; seasonal checks catch them. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “log what you skipped” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "Trust the physical house over stale notes — then fix the notes the same day. That is the kind of detail that feels optional until the week you need it."
      ]
    },
    {
      "id": "involve-the-household-briefly",
      "heading": "Involve the household briefly",
      "paragraphs": [
        "Get specific about “involve the household briefly” using your rooms, people, and gear — not a generic internet checklist. Retire devices when updates stop and repair quotes get silly. That sounds small until you are the person on the phone trying to remember it.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “involve the household briefly” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week."
      ]
    },
    {
      "id": "book-the-next-season-before-you-stop",
      "heading": "Book the next season before you stop",
      "paragraphs": [
        "Get specific about “book the next season before you stop” using your rooms, people, and gear — not a generic internet checklist. Hand a technician your short log instead of reconstructing a year from memory. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “book the next season before you stop” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive."
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
      "description": "Seasonal and routine tech checklists."
    },
    {
      "href": "/device-inventory",
      "label": "Device inventory",
      "description": "Hang maintenance notes on device records."
    },
    {
      "href": "/knowledge/maintenance/seasonal-home-tech-maintenance",
      "label": "Seasonal maintenance",
      "description": "Spring and fall tech checkups."
    }
  ],
  "keywords": [
    "seasonal tech maintenance",
    "home electronics checkup",
    "fall device maintenance"
  ],
  "readingMinutes": 7
} satisfies Omit<KnowledgeArticle, "readingMinutes"> & {
  readingMinutes: number;
};

article.readingMinutes = readingMinutesFromArticle(article);

export default article as KnowledgeArticle;
