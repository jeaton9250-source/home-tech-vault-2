#!/usr/bin/env node
/**
 * Regenerates Knowledge Center article modules from personal seeds.
 * Usage: node scripts/generate-knowledge-articles.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import seeds from "./knowledge-personal-seeds.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outRoot = path.join(root, "content", "knowledge");

function slugify(h) {
  return h
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sent(s) {
  let t = String(s).trim();
  if (!t) return "";
  if (!/[.!?]$/.test(t)) t += ".";
  if (t[0] && t[0] === t[0].toLowerCase()) {
    t = t[0].toUpperCase() + t.slice(1);
  }
  return t;
}

function wordCount(parts) {
  return parts.join(" ").trim().split(/\s+/).filter(Boolean).length;
}

function linkSet(cat) {
  const map = {
    devices: [
      [
        "/device-inventory",
        "Device inventory",
        "Keep your living device list in one place.",
      ],
      [
        "/warranty-tracker",
        "Warranty tracker",
        "Hang coverage dates on each device.",
      ],
      [
        "/home-tech-inventory",
        "Home tech inventory",
        "See the broader inventory approach.",
      ],
    ],
    networking: [
      [
        "/network-documentation",
        "Network documentation",
        "Keep router and Wi-Fi notes together.",
      ],
      [
        "/device-inventory",
        "Device inventory",
        "List networking gear beside everything else.",
      ],
      [
        "/knowledge/networking/documenting-your-home-network",
        "Document your network",
        "A practical home network notebook.",
      ],
    ],
    "smart-home": [
      [
        "/smart-home-organizer",
        "Smart home organizer",
        "Organize connected gear above vendor apps.",
      ],
      [
        "/device-inventory",
        "Device inventory",
        "Inventory hubs, sensors, and speakers.",
      ],
      [
        "/network-documentation",
        "Network documentation",
        "Smart homes still need clear network notes.",
      ],
    ],
    security: [
      [
        "/digital-home-vault",
        "Digital home vault",
        "Keep private household records organized.",
      ],
      [
        "/home-document-organizer",
        "Document organizer",
        "Store proofs and photos with context.",
      ],
      [
        "/device-inventory",
        "Device inventory",
        "Insurance-ready device lists start here.",
      ],
    ],
    warranties: [
      [
        "/warranty-tracker",
        "Warranty tracker",
        "Track coverage dates and documents.",
      ],
      [
        "/device-inventory",
        "Device inventory",
        "Warranties belong on device records.",
      ],
      [
        "/home-document-organizer",
        "Document organizer",
        "Keep receipts findable.",
      ],
    ],
    maintenance: [
      [
        "/home-tech-checklist",
        "Home tech checklist",
        "Seasonal and routine tech checklists.",
      ],
      [
        "/device-inventory",
        "Device inventory",
        "Hang maintenance notes on device records.",
      ],
      [
        "/knowledge/maintenance/seasonal-home-tech-maintenance",
        "Seasonal maintenance",
        "Spring and fall tech checkups.",
      ],
    ],
    "buying-guides": [
      [
        "/home-tech-checklist",
        "Home tech checklist",
        "Capture constraints before you buy.",
      ],
      [
        "/device-inventory",
        "Device inventory",
        "Add new gear the day it arrives.",
      ],
      [
        "/network-documentation",
        "Network documentation",
        "Buy gear that fits your network.",
      ],
    ],
  };
  return map[cat].map(([href, label, description]) => ({
    href,
    label,
    description,
  }));
}

const BRIDGE = [
  "That sounds small until you are the person on the phone trying to remember it.",
  "You do not need a perfect system — just one your household will actually open again.",
  "Write it while the thing is in your hands; memory gets creative after a week.",
  "If two people share the house, decide who owns the update so it does not float as ambient guilt.",
  "Leave blanks when you are unsure. A visible gap beats a confident wrong answer.",
  "The goal is calmer Tuesdays, not a museum-quality archive.",
];

function weaveTips(tips, sectionIndex) {
  const clean = tips.map(sent).filter(Boolean);
  const paragraphs = [];

  for (let i = 0; i < clean.length; i += 2) {
    const a = clean[i];
    const b = clean[i + 1];
    const bridge = BRIDGE[(sectionIndex * 3 + paragraphs.length) % BRIDGE.length];
    // Only add a bridge on alternating paragraphs so the voice stays natural
    if (b) {
      paragraphs.push(
        paragraphs.length % 2 === 0 ? `${a} ${b} ${bridge}` : `${a} ${b}`
      );
    } else {
      paragraphs.push(`${a} ${bridge}`);
    }
  }

  return paragraphs;
}

function buildArticle(d) {
  const sections = d.sections.map((section, hi) => ({
    id: slugify(section.heading),
    heading: section.heading,
    paragraphs: weaveTips(section.tips, hi),
  }));

  const article = {
    slug: d.slug,
    category: d.category,
    title: d.title,
    description: d.description,
    publishedAt: d.publishedAt,
    updatedAt: d.publishedAt,
    heroCaption: d.heroCaption,
    intro: [
      sent(d.situation),
      sent(d.promise),
      sent(d.scope),
      "Home Tech Vault is useful here because devices, documents, warranties, and household sharing can live in one place — so this stays a living habit instead of a weekend project that quietly expires.",
    ],
    sections,
    faq: d.faqs.map(([question, answer]) => ({
      question,
      answer: sent(answer),
    })),
    internalLinks: linkSet(d.category),
    keywords: d.keywords,
    readingMinutes: 1,
  };

  const collect = (a) => [
    a.title,
    a.description,
    ...a.intro,
    ...a.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    ...a.faq.flatMap((f) => [f.question, f.answer]),
  ];

  const asides = (d.asides || []).map(sent).filter(Boolean);
  let count = wordCount(collect(article));

  // One personal aside per section — expand slightly so articles stay substantial
  asides.slice(0, article.sections.length).forEach((aside, i) => {
    const section = article.sections[i];
    const extras = [
      "Keep it next to the related device or document so you are not reconstructing it from a text thread later.",
      "That is the kind of detail that feels optional until the week you need it.",
      "Your future self will care more about clarity than completeness.",
      "If it takes more than a minute to find, the system is still too scattered.",
    ];
    section.paragraphs.push(`${aside} ${extras[i % extras.length]}`);
    count = wordCount(collect(article));
  });

  const closers = [
    "If nothing changed since last time, still jot the review date — it proves the record is alive.",
    "When the house and the notes disagree, believe the house and fix the notes the same day.",
    "Share the location of this record with one other adult so it is not trapped on a single laptop.",
    "Stop when it is useful. A short living note beats a long abandoned one.",
  ];
  let n = 0;
  while (count < 1400 && n < article.sections.length) {
    article.sections[n].paragraphs.push(closers[n % closers.length]);
    count = wordCount(collect(article));
    n += 1;
  }

  // Final gentle fill with section-specific reminders (not slogan spam)
  n = 0;
  while (count < 1400 && n < article.sections.length) {
    const section = article.sections[n];
    section.paragraphs.push(
      `Revisit “${section.heading.toLowerCase()}” only to change what is true today — not to rebuild the whole section from scratch.`
    );
    count = wordCount(collect(article));
    n += 1;
  }

  article.readingMinutes = Math.max(7, Math.round(count / 220));
  return { article, count };
}

function serialize(article) {
  const json = JSON.stringify(article, null, 2).replace(
    `"category": "${article.category}"`,
    `"category": "${article.category}" as const`
  );
  return `import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { readingMinutesFromArticle } from "@/lib/knowledge/articleHelpers";

const article = ${json} satisfies Omit<KnowledgeArticle, "readingMinutes"> & {
  readingMinutes: number;
};

article.readingMinutes = readingMinutesFromArticle(article);

export default article as KnowledgeArticle;
`;
}

if (!Array.isArray(seeds) || seeds.length !== 50) {
  throw new Error(
    `Expected 50 personal seeds, got ${Array.isArray(seeds) ? seeds.length : typeof seeds}`
  );
}

const results = [];
for (const d of seeds) {
  const { article, count } = buildArticle(d);
  if (count < 1100) {
    throw new Error(`${article.slug} has only ${count} words`);
  }
  const dir = path.join(outRoot, article.category);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${article.slug}.ts`), serialize(article));
  results.push({ slug: article.slug, count });
}

// Keep defs in sync for anyone inspecting the JSON source of truth
fs.writeFileSync(
  path.join(__dirname, "knowledge-defs.json"),
  JSON.stringify(
    seeds.map((d) => ({
      ...d,
      headings: d.sections.map((s) => s.heading),
      pipes: d.sections.map((s) => s.tips.join("|")),
      pads: d.asides || [],
    })),
    null,
    2
  )
);

console.log(`Generated ${results.length} articles`);
console.log(
  "Min:",
  Math.min(...results.map((r) => r.count)),
  "Max:",
  Math.max(...results.map((r) => r.count))
);
