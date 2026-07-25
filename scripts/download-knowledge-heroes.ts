#!/usr/bin/env node
/**
 * Download realistic hero photos for Knowledge Center articles.
 * Usage: node --import tsx scripts/download-knowledge-heroes.ts
 */

import { mkdirSync, writeFileSync, existsSync, statSync } from "fs";
import { join } from "path";

import {
  KNOWLEDGE_HERO_SOURCES,
  type KnowledgeHeroSource,
} from "../lib/knowledge/heroImages";

const OUT_DIR = join(process.cwd(), "public/knowledge/heroes");

function sourceUrl(meta: KnowledgeHeroSource): string {
  if (meta.pexelsId != null) {
    return `https://images.pexels.com/photos/${meta.pexelsId}/pexels-photo-${meta.pexelsId}.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop`;
  }
  if (meta.unsplashId) {
    return `https://images.unsplash.com/photo-${meta.unsplashId}?auto=format&fit=crop&w=1600&h=900&q=80`;
  }
  throw new Error("Hero source needs unsplashId or pexelsId");
}

async function download(slug: string, meta: KnowledgeHeroSource) {
  const outPath = join(OUT_DIR, `${slug}.jpg`);
  const url = sourceUrl(meta);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "HomeTechVaultHeroDownloader/1.0",
      Accept: "image/jpeg,image/*,*/*",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`${slug}: HTTP ${response.status} for ${url}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("image")) {
    throw new Error(
      `${slug}: unexpected content-type ${contentType}`
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 5_000) {
    throw new Error(`${slug}: file too small (${buffer.length} bytes)`);
  }

  writeFileSync(outPath, buffer);
  return { outPath, bytes: buffer.length };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const entries = Object.entries(KNOWLEDGE_HERO_SOURCES);
  let ok = 0;
  const failed: string[] = [];

  for (const [slug, meta] of entries) {
    const outPath = join(OUT_DIR, `${slug}.jpg`);
    if (existsSync(outPath) && statSync(outPath).size > 5_000) {
      console.log(`skip ${slug}`);
      ok += 1;
      continue;
    }

    try {
      const result = await download(slug, meta);
      console.log(`ok   ${slug} (${result.bytes} bytes)`);
      ok += 1;
    } catch (error) {
      console.error(
        `fail ${slug}:`,
        error instanceof Error ? error.message : error
      );
      failed.push(slug);
    }
  }

  const fallback = join(OUT_DIR, "_fallback.jpg");
  if (!existsSync(fallback) || statSync(fallback).size < 5_000) {
    try {
      await download("_fallback", {
        unsplashId: "1516321318423-f06f85e504b3",
        alt: "Fallback",
        caption: "Fallback",
      });
      console.log("wrote _fallback.jpg");
    } catch (error) {
      const firstOk = entries.find(([slug]) =>
        existsSync(join(OUT_DIR, `${slug}.jpg`))
      );
      if (firstOk) {
        const { copyFileSync } = await import("fs");
        copyFileSync(join(OUT_DIR, `${firstOk[0]}.jpg`), fallback);
        console.log("copied _fallback.jpg");
      } else {
        console.error("Could not create fallback", error);
      }
    }
  }

  console.log(`\nDone: ${ok}/${entries.length} heroes`);
  if (failed.length) {
    console.log("Failed:", failed.join(", "));
    process.exitCode = 1;
  }
}

main();
