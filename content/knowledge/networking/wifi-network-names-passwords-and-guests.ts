import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { readingMinutesFromArticle } from "@/lib/knowledge/articleHelpers";

const article = {
  "slug": "wifi-network-names-passwords-and-guests",
  "category": "networking" as const,
  "title": "Wi-Fi Names, Passwords, and Guest Access Notes",
  "description": "Keep household Wi-Fi details organized for family and guests without texting passwords forever.",
  "publishedAt": "2026-03-20",
  "updatedAt": "2026-03-20",
  "heroCaption": "Keep household Wi-Fi details organized for family and guests without texting passwords forever.",
  "intro": [
    "Keep household Wi-Fi details organized for family and guests without texting passwords forever. Most homes only feel the gap when something breaks, goes missing, or a stranger on the phone asks for details nobody wrote down.",
    "You will leave with a practical way to handle this that fits a real household — short enough to keep, specific enough to use under stress.",
    "We will cover what to write down, where it should live, who can see it, and how to keep it current as gear and people change.",
    "Home Tech Vault is useful here because devices, documents, warranties, and household sharing can live in one place — so this stays a living habit instead of a weekend project that quietly expires."
  ],
  "sections": [
    {
      "id": "name-networks-the-way-guests-will-ask",
      "heading": "Name networks the way guests will ask",
      "paragraphs": [
        "Get specific about “name networks the way guests will ask” using your rooms, people, and gear — not a generic internet checklist. Start at the modem and follow the cables until you hit Wi-Fi — write that path down. That sounds small until you are the person on the phone trying to remember it.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “name networks the way guests will ask” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "The first version of these network notes should be usable tonight, not impressive next year. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive."
      ]
    },
    {
      "id": "keep-passwords-out-of-shared-notes",
      "heading": "Keep passwords out of shared notes",
      "paragraphs": [
        "Get specific about “keep passwords out of shared notes” using your rooms, people, and gear — not a generic internet checklist. Nickname gear after rooms so non-techy adults can point to it. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “keep passwords out of shared notes” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "I used to overbuild systems for this. The ones that survived were shorter and lived where we already looked. That is the kind of detail that feels optional until the week you need it.",
        "When the house and the notes disagree, believe the house and fix the notes the same day."
      ]
    },
    {
      "id": "set-up-guest-access-on-purpose",
      "heading": "Set up guest access on purpose",
      "paragraphs": [
        "Get specific about “set up guest access on purpose” using your rooms, people, and gear — not a generic internet checklist. Passwords belong in a password manager; the vault holds where the gear lives. That sounds small until you are the person on the phone trying to remember it.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “set up guest access on purpose” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "If only one person knows where the record is, you do not have a household system yet. Your future self will care more about clarity than completeness.",
        "Share the location of this record with one other adult so it is not trapped on a single laptop."
      ]
    },
    {
      "id": "separate-iot-from-main-wi-fi-when-you-can",
      "heading": "Separate IoT from main Wi-Fi when you can",
      "paragraphs": [
        "Get specific about “separate IoT from main Wi-Fi when you can” using your rooms, people, and gear — not a generic internet checklist. Label wall jacks and the one mystery Ethernet run before you move furniture again. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Keep notes short enough that you will open them again next month. If two adults share the house, name who updates this so it is not ambient guilt.",
        "When “separate IoT from main Wi-Fi when you can” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "After holidays, moves, or a big purchase, schedule a twenty-minute catch-up before details evaporate. If it takes more than a minute to find, the system is still too scattered."
      ]
    },
    {
      "id": "write-who-knows-the-credentials",
      "heading": "Write who knows the credentials",
      "paragraphs": [
        "Get specific about “write who knows the credentials” using your rooms, people, and gear — not a generic internet checklist. Keep ISP account number and modem ID where you can read them during an outage call. That sounds small until you are the person on the phone trying to remember it.",
        "When the house and your notes disagree, trust the house and fix the notes the same day. Leave blanks when you are unsure — a visible gap beats a confident wrong answer.",
        "When “write who knows the credentials” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week.",
        "When support asks for something you lack, add it immediately so the next call is shorter. Keep it next to the related device or document so you are not reconstructing it from a text thread later."
      ]
    },
    {
      "id": "update-after-rotations",
      "heading": "Update after rotations",
      "paragraphs": [
        "Get specific about “update after rotations” using your rooms, people, and gear — not a generic internet checklist. Guest Wi-Fi notes save text threads at every dinner party. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "If two adults share the house, name who updates this so it is not ambient guilt. Date the last review even if nothing changed, so the record feels alive.",
        "When “update after rotations” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive.",
        "Trust the physical house over stale notes — then fix the notes the same day. That is the kind of detail that feels optional until the week you need it."
      ]
    },
    {
      "id": "help-sitters-without-oversharing",
      "heading": "Help sitters without oversharing",
      "paragraphs": [
        "Get specific about “help sitters without oversharing” using your rooms, people, and gear — not a generic internet checklist. After you replace a router, close the old record the same day. That sounds small until you are the person on the phone trying to remember it.",
        "Leave blanks when you are unsure — a visible gap beats a confident wrong answer. Keep notes short enough that you will open them again next month.",
        "When “help sitters without oversharing” is good enough to use tonight, stop polishing and move on. Write it while the thing is in your hands; memory gets creative after a week."
      ]
    },
    {
      "id": "recover-calmly-from-lockouts",
      "heading": "Recover calmly from lockouts",
      "paragraphs": [
        "Get specific about “recover calmly from lockouts” using your rooms, people, and gear — not a generic internet checklist. Once a year, pretend you are the house sitter and try to find the network notes. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Date the last review even if nothing changed, so the record feels alive. When the house and your notes disagree, trust the house and fix the notes the same day.",
        "When “recover calmly from lockouts” is good enough to use tonight, stop polishing and move on. The goal is calmer Tuesdays, not a museum-quality archive."
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
      "href": "/network-documentation",
      "label": "Network documentation",
      "description": "Keep router and Wi-Fi notes together."
    },
    {
      "href": "/device-inventory",
      "label": "Device inventory",
      "description": "List networking gear beside everything else."
    },
    {
      "href": "/knowledge/networking/documenting-your-home-network",
      "label": "Document your network",
      "description": "A practical home network notebook."
    }
  ],
  "keywords": [
    "wifi password organizer",
    "guest wifi notes",
    "ssid documentation"
  ],
  "readingMinutes": 7
} satisfies Omit<KnowledgeArticle, "readingMinutes"> & {
  readingMinutes: number;
};

article.readingMinutes = readingMinutesFromArticle(article);

export default article as KnowledgeArticle;
