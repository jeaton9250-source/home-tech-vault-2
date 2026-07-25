import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { readingMinutesFromArticle } from "@/lib/knowledge/articleHelpers";

const article = {
  "slug": "household-access-without-oversharing",
  "category": "security" as const,
  "title": "Household Access Without Oversharing",
  "description": "Roles, viewers, and practical boundaries so kids, partners, and helpers see what they need — and nothing more.",
  "publishedAt": "2026-04-23",
  "updatedAt": "2026-04-23",
  "heroCaption": "Roles, viewers, and practical boundaries so kids, partners, and helpers see what they need — and nothing more.",
  "intro": [
    "Roles, viewers, and practical boundaries so kids, partners, and helpers see what they need — and nothing more. Most homes only feel the gap when something breaks, goes missing, or a stranger on the phone asks for details nobody wrote down.",
    "You will leave with a practical way to handle this that fits a real household — short enough to keep, specific enough to use under stress.",
    "We will cover what to write down, where it should live, who can see it, and how to keep it current as gear and people change.",
    "Home Tech Vault is useful here because devices, documents, warranties, and household sharing can live in one place — so this stays a living habit instead of a weekend project that quietly expires."
  ],
  "sections": [
    {
      "id": "define-roles-clearly",
      "heading": "Define roles clearly",
      "paragraphs": [
        "Get specific about “define roles clearly” using your rooms, people, and gear — not a generic internet checklist. Decide what is a secret versus what is just useful household context. That sounds small until you are the person on the phone trying to remember it.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “define roles clearly” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "The first version of these security notes should be usable tonight, not impressive next year. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive."
      ]
    },
    {
      "id": "separate-viewers-from-admins",
      "heading": "Separate viewers from admins",
      "paragraphs": [
        "Get specific about “separate viewers from admins” using your rooms, people, and gear — not a generic internet checklist. A house sitter needs the alarm panel path, not your password manager. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “separate viewers from admins” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "I used to overbuild systems for this. The ones that survived were shorter and lived where we already looked. That is the kind of detail that feels optional until the week you need it.",
        "When the house and the notes disagree, believe the house and fix the notes the same day."
      ]
    },
    {
      "id": "onboard-new-adults-carefully",
      "heading": "Onboard new adults carefully",
      "paragraphs": [
        "Get specific about “onboard new adults carefully” using your rooms, people, and gear — not a generic internet checklist. Insurance wants photos, serials, and receipts more than a narrative essay. That sounds small until you are the person on the phone trying to remember it.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “onboard new adults carefully” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "If only one person knows where the record is, you do not have a household system yet. Your future self will care more about clarity than completeness.",
        "Share the location of this record with one other adult so it is not trapped on a single laptop."
      ]
    },
    {
      "id": "handle-roommates-and-partners",
      "heading": "Handle roommates and partners",
      "paragraphs": [
        "Get specific about “handle roommates and partners” using your rooms, people, and gear — not a generic internet checklist. Travel packets should list critical devices and who to call, not every gadget you own. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Keep notes short enough that you will open them again next month. If two adults share the house, name who updates this so it is not ambient guilt.",
        "When “handle roommates and partners” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "After holidays, moves, or a big purchase, schedule a twenty-minute catch-up before details evaporate. If it takes more than a minute to find, the system is still too scattered.",
        "Stop when it is useful. A short living note beats a long abandoned one."
      ]
    },
    {
      "id": "review-after-breakups-or-moves",
      "heading": "Review after breakups or moves",
      "paragraphs": [
        "Get specific about “review after breakups or moves” using your rooms, people, and gear — not a generic internet checklist. Cameras need location, account owner, and how to re-add them after a reset. That sounds small until you are the person on the phone trying to remember it.",
        "When the house and your notes disagree, trust the house and fix the notes the same day. Leave blanks when you are unsure — a visible gap beats a confident wrong answer.",
        "When “review after breakups or moves” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "When support asks for something you lack, add it immediately so the next call is shorter. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive."
      ]
    },
    {
      "id": "avoid-shared-master-passwords",
      "heading": "Avoid shared master passwords",
      "paragraphs": [
        "Get specific about “avoid shared master passwords” using your rooms, people, and gear — not a generic internet checklist. If someone moves out, revoke shared access the same week — not later. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “avoid shared master passwords” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "Trust the physical house over stale notes — then fix the notes the same day. That is the kind of detail that feels optional until the week you need it.",
        "When the house and the notes disagree, believe the house and fix the notes the same day."
      ]
    },
    {
      "id": "document-exceptions",
      "heading": "Document exceptions",
      "paragraphs": [
        "Get specific about “document exceptions” using your rooms, people, and gear — not a generic internet checklist. Keep an emergency copy reachable if the house Wi-Fi is dead. That sounds small until you are the person on the phone trying to remember it.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “document exceptions” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week."
      ]
    },
    {
      "id": "keep-kids-access-age-appropriate",
      "heading": "Keep kids access age-appropriate",
      "paragraphs": [
        "Get specific about “keep kids access age-appropriate” using your rooms, people, and gear — not a generic internet checklist. Review the private vault after a breakup, roommate change, or contractor visit. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “keep kids access age-appropriate” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive."
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
      "href": "/digital-home-vault",
      "label": "Digital home vault",
      "description": "Keep private household records organized."
    },
    {
      "href": "/home-document-organizer",
      "label": "Document organizer",
      "description": "Store proofs and photos with context."
    },
    {
      "href": "/device-inventory",
      "label": "Device inventory",
      "description": "Insurance-ready device lists start here."
    }
  ],
  "keywords": [
    "household access control",
    "family sharing permissions",
    "viewer access home tech"
  ],
  "readingMinutes": 7
} satisfies Omit<KnowledgeArticle, "readingMinutes"> & {
  readingMinutes: number;
};

article.readingMinutes = readingMinutesFromArticle(article);

export default article as KnowledgeArticle;
