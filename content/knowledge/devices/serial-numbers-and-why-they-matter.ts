import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { readingMinutesFromArticle } from "@/lib/knowledge/articleHelpers";

const article = {
  "slug": "serial-numbers-and-why-they-matter",
  "category": "devices" as const,
  "title": "Serial Numbers and Why They Matter for Home Tech",
  "description": "Where to find serials, how to store them safely, and why they unlock warranties, insurance claims, and support tickets.",
  "publishedAt": "2026-03-04",
  "updatedAt": "2026-03-04",
  "heroCaption": "Where to find serials, how to store them safely, and why they unlock warranties, insurance claims, and support tickets.",
  "intro": [
    "Where to find serials, how to store them safely, and why they unlock warranties, insurance claims, and support tickets. Most homes only feel the gap when something breaks, goes missing, or a stranger on the phone asks for details nobody wrote down.",
    "You will leave with a practical way to handle this that fits a real household — short enough to keep, specific enough to use under stress.",
    "We will cover what to write down, where it should live, who can see it, and how to keep it current as gear and people change.",
    "Home Tech Vault is useful here because devices, documents, warranties, and household sharing can live in one place — so this stays a living habit instead of a weekend project that quietly expires."
  ],
  "sections": [
    {
      "id": "why-serials-suddenly-matter",
      "heading": "Why serials suddenly matter",
      "paragraphs": [
        "Support and insurance treat the serial as the device's fingerprint. Marketing names are friendly; serials unlock tickets. That sounds small until you are the person on the phone trying to remember it.",
        "If you only save one identifier, make it the serial. Stolen-device reports often stall without it.",
        "The first version of these device notes should be usable tonight, not impressive next year. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive.",
        "Revisit “why serials suddenly matter” only to change what is true today — not to rebuild the whole section from scratch."
      ]
    },
    {
      "id": "where-they-actually-hide",
      "heading": "Where they actually hide",
      "paragraphs": [
        "Check the underside, battery bay, box, and Settings About screen. TVs hide labels on the back or behind HDMI flaps. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Routers print serials on the bottom and in admin status. Phones may show IMEI in settings and on the SIM tray.",
        "I used to overbuild systems for this. The ones that survived were shorter and lived where we already looked. That is the kind of detail that feels optional until the week you need it.",
        "When the house and the notes disagree, believe the house and fix the notes the same day.",
        "Revisit “where they actually hide” only to change what is true today — not to rebuild the whole section from scratch."
      ]
    },
    {
      "id": "save-more-than-the-digits",
      "heading": "Save more than the digits",
      "paragraphs": [
        "Write brand and exact model beside every serial. Note where you found it so the next search is faster. That sounds small until you are the person on the phone trying to remember it.",
        "Photograph tiny labels, then type the digits while readable. For phones, keep IMEI and the account that can lock the device.",
        "If only one person knows where the record is, you do not have a household system yet. Your future self will care more about clarity than completeness.",
        "Share the location of this record with one other adult so it is not trapped on a single laptop.",
        "Revisit “save more than the digits” only to change what is true today — not to rebuild the whole section from scratch."
      ]
    },
    {
      "id": "when-the-sticker-is-gone",
      "heading": "When the sticker is gone",
      "paragraphs": [
        "Mark unknown instead of inventing digits. Check order emails and purchase history before you give up. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Ask the retailer for an invoice if you are still in the return window. For used gear, note seller contact and any partial ID.",
        "After holidays, moves, or a big purchase, schedule a twenty-minute catch-up before details evaporate. If it takes more than a minute to find, the system is still too scattered.",
        "Stop when it is useful. A short living note beats a long abandoned one.",
        "Revisit “when the sticker is gone” only to change what is true today — not to rebuild the whole section from scratch."
      ]
    },
    {
      "id": "keep-them-findable-without-a-secret-stash",
      "heading": "Keep them findable without a secret stash",
      "paragraphs": [
        "Keep serials next to the device record, not in a random notes app. Avoid posting them publicly even though they are not passwords. That sounds small until you are the person on the phone trying to remember it.",
        "Do not bury them only inside a vendor app you might lose. Share view access with whoever handles warranties.",
        "When support asks for something you lack, add it immediately so the next call is shorter. Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
        "If nothing changed since last time, still jot the review date — it proves the record is alive.",
        "Revisit “keep them findable without a secret stash” only to change what is true today — not to rebuild the whole section from scratch."
      ]
    },
    {
      "id": "make-label-photos-actually-useful",
      "heading": "Make label photos actually useful",
      "paragraphs": [
        "Photograph labels straight-on with glare minimized. Crop so digits are readable without opening a huge album. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "File the photo on the device record the same day. Retake if 8/B or 0/O look ambiguous.",
        "Trust the physical house over stale notes — then fix the notes the same day. That is the kind of detail that feels optional until the week you need it.",
        "When the house and the notes disagree, believe the house and fix the notes the same day.",
        "Revisit “make label photos actually useful” only to change what is true today — not to rebuild the whole section from scratch."
      ]
    },
    {
      "id": "update-when-gear-changes",
      "heading": "Update when gear changes",
      "paragraphs": [
        "Retire old serials when you replace a device. Ask whether a board-level repair changed the serial. That sounds small until you are the person on the phone trying to remember it.",
        "Gifted devices need a fresh entry. Delete duplicates so support never gets the wrong number.",
        "Share the location of this record with one other adult so it is not trapped on a single laptop.",
        "Revisit “update when gear changes” only to change what is true today — not to rebuild the whole section from scratch."
      ]
    },
    {
      "id": "use-them-on-real-calls",
      "heading": "Use them on real calls",
      "paragraphs": [
        "Have serial, model, and proof open before you call. Paste carefully — transposed digits waste whole calls. If two people share the house, decide who owns the update so it does not float as ambient guilt.",
        "Pair serials with room photos for insurance. Verify trade-in serials match the device in your hand.",
        "Stop when it is useful. A short living note beats a long abandoned one.",
        "Revisit “use them on real calls” only to change what is true today — not to rebuild the whole section from scratch."
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
    "device serial number",
    "electronics serial",
    "warranty serial number"
  ],
  "readingMinutes": 7
} satisfies Omit<KnowledgeArticle, "readingMinutes"> & {
  readingMinutes: number;
};

article.readingMinutes = readingMinutesFromArticle(article);

export default article as KnowledgeArticle;
