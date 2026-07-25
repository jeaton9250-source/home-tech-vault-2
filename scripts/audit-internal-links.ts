#!/usr/bin/env node
/**
 * Audit public content URLs for broken catalog links and orphans.
 * Usage: node --import tsx scripts/audit-internal-links.ts
 */

import { auditInternalLinks } from "../lib/seo/linkAudit";
import { getAllKnowledgeArticles } from "../lib/knowledge/articles";
import { knowledgeArticlePath } from "../lib/knowledge/categories";
import { listAllIndexableContentPaths } from "../lib/seo/linkAudit";

async function main() {
  const report = auditInternalLinks();

  // Also validate knowledge article module internalLinks
  const articles = await getAllKnowledgeArticles();
  const valid = new Set(listAllIndexableContentPaths());
  const allow = new Set([
    "/signup",
    "/login",
    "/demo",
    "/features",
    "/contact",
    "/trust",
    "/privacy",
    "/terms",
    "/warranty-tracker",
    "/smart-home-organizer",
    "/digital-home-vault",
    "/home-inventory-software",
    "/home-tech-checklist",
    "/homeowner-tech-management",
    "/home-tech-inventory",
    "/device-inventory",
    "/home-document-organizer",
    "/network-documentation",
    "/pricing",
    "/knowledge",
  ]);

  for (const article of articles) {
    const source = knowledgeArticlePath(
      article.category,
      article.slug
    );
    for (const link of article.internalLinks) {
      const href = link.href.split("#")[0] ?? link.href;
      if (
        href.startsWith("/") &&
        !valid.has(href) &&
        !allow.has(href) &&
        ![...allow].some(
          (a) => href === a || href.startsWith(`${a}/`)
        ) &&
        !href.startsWith("/knowledge/") &&
        !href.startsWith("/guides/") &&
        !href.startsWith("/compare/") &&
        !href.startsWith("/faq/")
      ) {
        // Allow knowledge/guides paths if in valid set after prefix check
        if (!valid.has(href)) {
          report.broken.push({
            source,
            href,
            reason: "Knowledge article internalLinks target unknown",
          });
        }
      } else if (
        href.startsWith("/knowledge/") ||
        href.startsWith("/guides/") ||
        href.startsWith("/compare/") ||
        href.startsWith("/faq/")
      ) {
        if (!valid.has(href)) {
          report.broken.push({
            source,
            href,
            reason: "Knowledge article internalLinks target unknown",
          });
        }
      }
    }
  }

  console.log("Indexable paths:", report.validPaths.length);
  console.log("Broken links:", report.broken.length);
  if (report.broken.length) {
    for (const issue of report.broken.slice(0, 40)) {
      console.log(
        `  ${issue.source} -> ${issue.href} (${issue.reason})`
      );
    }
  }
  console.log("Orphan pages:", report.orphans.length);
  if (report.orphans.length) {
    for (const path of report.orphans.slice(0, 40)) {
      console.log(`  ${path}`);
    }
  }

  if (report.broken.length || report.orphans.length) {
    process.exitCode = 1;
  } else {
    console.log("OK: no broken links, no orphan pages.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
