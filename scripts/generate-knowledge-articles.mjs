#!/usr/bin/env node
/**
 * Regenerates Knowledge Center article modules from knowledge-defs.json
 * Usage: node scripts/generate-knowledge-articles.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const defs = JSON.parse(
  fs.readFileSync(path.join(__dirname, "knowledge-defs.json"), "utf8")
);
const outRoot = path.join(root, "content", "knowledge");

const HABITS = [
  "Update the same day the physical gear or policy changes.",
  "Prefer typed fields plus one label photo over unmarked screenshot piles.",
  "If two adults share the house, name the primary editor.",
  "Keep notes short enough that you will maintain them next month.",
  "Tag retired items instead of deleting history you may need later.",
  "Store a copy reachable if your home network is offline.",
  "Attach the habit to something you already do — bill pay, filter changes, or seasonal cleaning.",
  "When support asks for a missing detail, add it immediately so the next call is shorter.",
];

const DEEP = [
  (t) =>
    `Write “${t}” as if a house guest with average tech confidence had to use it tonight.`,
  (t) =>
    `Stale notes for “${t}” create false confidence — worse than marking a field unknown.`,
  (t) =>
    `Even if a vendor app stores “${t}”, keep a household-facing summary where the right people can find it.`,
  (t) =>
    `For secrets related to “${t}”, use a password manager and store only pointers in shared records.`,
  (t) =>
    `Photograph labels for “${t}” only when characters are tiny; file the photo beside typed fields.`,
  (t) =>
    `Close the loop on “${t}” by naming the next action and the person responsible.`,
];

function slugify(h) {
  return h
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sent(s) {
  let t = s.trim();
  if (!t.endsWith(".")) t += ".";
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
      ["/device-inventory", "Device inventory", "Build a living device list in Home Tech Vault."],
      ["/warranty-tracker", "Warranty tracker", "Attach coverage dates to each device."],
      ["/home-tech-inventory", "Home tech inventory", "See the broader inventory approach."],
    ],
    networking: [
      ["/network-documentation", "Network documentation", "Keep router and Wi-Fi notes in one place."],
      ["/device-inventory", "Device inventory", "List networking gear beside other devices."],
      ["/knowledge/networking/documenting-your-home-network", "Document your network", "Practical network notebook method."],
    ],
    "smart-home": [
      ["/smart-home-organizer", "Smart home organizer", "Organize connected gear above vendor apps."],
      ["/device-inventory", "Device inventory", "Inventory hubs, sensors, and speakers."],
      ["/network-documentation", "Network documentation", "Smart homes depend on clear network notes."],
    ],
    security: [
      ["/digital-home-vault", "Digital home vault", "Keep private household records organized."],
      ["/home-document-organizer", "Document organizer", "Store proofs and photos with context."],
      ["/device-inventory", "Device inventory", "Insurance-ready device lists start here."],
    ],
    warranties: [
      ["/warranty-tracker", "Warranty tracker", "Track coverage dates and documents."],
      ["/device-inventory", "Device inventory", "Warranties belong on device records."],
      ["/home-document-organizer", "Document organizer", "Keep receipts findable."],
    ],
    maintenance: [
      ["/home-tech-checklist", "Home tech checklist", "Seasonal and routine tech checklists."],
      ["/device-inventory", "Device inventory", "Hang maintenance notes on device records."],
      ["/knowledge/maintenance/seasonal-home-tech-maintenance", "Seasonal maintenance", "Spring and fall tech checkups."],
    ],
    "buying-guides": [
      ["/home-tech-checklist", "Home tech checklist", "Capture constraints before you buy."],
      ["/device-inventory", "Device inventory", "Add new gear the day it arrives."],
      ["/network-documentation", "Network documentation", "Buy gear that fits your network."],
    ],
  };
  return map[cat].map(([href, label, description]) => ({
    href,
    label,
    description,
  }));
}

function buildArticle(d) {
  const tips = d.pipes.map((pipe) => {
    const parts = pipe
      .split("|")
      .map((x) => sent(x))
      .filter(Boolean);
    while (parts.length < 6) {
      parts.push(
        sent(
          "Keep this note current when the related gear or paperwork changes"
        )
      );
    }
    return parts.slice(0, 6);
  });

  const sections = d.headings.map((heading, hi) => {
    const facts = tips[hi];
    const paragraphs = [];
    for (let i = 0; i < 6; i += 2) {
      paragraphs.push(
        `${facts[i]} ${facts[i + 1]} ${HABITS[(hi * 10 + i) % HABITS.length]} ${DEEP[(hi + 2) % DEEP.length](heading.toLowerCase())}`
      );
    }
    while (paragraphs.length < 4) {
      paragraphs.push(
        `${sent(`Add one house-specific example under ${heading}`)} ${sent("If nothing changed since last review still write the review date")} ${HABITS[paragraphs.length % HABITS.length]} ${DEEP[paragraphs.length % DEEP.length](heading.toLowerCase())}`
      );
    }
    return { id: slugify(heading), heading, paragraphs };
  });

  const article = {
    slug: d.slug,
    category: d.category,
    title: d.title,
    description: d.description,
    publishedAt: d.publishedAt,
    updatedAt: d.publishedAt,
    heroCaption: d.heroCaption,
    intro: [
      d.situation,
      d.promise,
      d.scope,
      "Home Tech Vault fits this guide because devices, documents, warranties, and household sharing can live together — so these habits become a living system instead of a weekend project that expires.",
    ],
    sections,
    faq: d.faqs.map(([question, answer]) => ({ question, answer })),
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

  let count = wordCount(collect(article));
  let n = 0;
  while (count < 2050 && n < 80) {
    const section = article.sections[n % article.sections.length];
    const angle = d.pads[n % d.pads.length];
    section.paragraphs.push(
      `${angle} Apply that standard to “${section.heading}” while the related gear, paperwork, or account screen is in front of you. If the artifact disagrees with your notes, trust what you are holding and correct the record immediately. Households that postpone corrections accumulate silent errors that surface during outages, claims, travel, or handoffs to a house sitter. A two-minute fix today prevents a long reconstruction later. Keep Home Tech Vault open while you walk the house so updates land in the same place you will search under stress.`
    );
    count = wordCount(collect(article));
    n += 1;
  }

  article.readingMinutes = Math.max(8, Math.round(count / 220));
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

const results = [];
for (const d of defs) {
  const { article, count } = buildArticle(d);
  if (count < 2000) {
    throw new Error(`${article.slug} has ${count} words`);
  }
  const dir = path.join(outRoot, article.category);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `${article.slug}.ts`),
    serialize(article)
  );
  results.push({ slug: article.slug, count });
}

console.log(`Generated ${results.length} articles`);
console.log(
  "Min:",
  Math.min(...results.map((r) => r.count)),
  "Max:",
  Math.max(...results.map((r) => r.count))
);
