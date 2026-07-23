import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { ImageResponse } from "next/og";

import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  OgImageContent,
} from "../lib/marketing/ogImageContent";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(scriptDir, "..");
const outputPath = join(rootDir, "public/og-image.png");

async function main() {
  const response = new ImageResponse(<OgImageContent />, {
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
  });

  const buffer = Buffer.from(await response.arrayBuffer());

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, buffer);

  console.log(`Wrote ${outputPath} (${buffer.length} bytes)`);
}

main().catch((error) => {
  console.error("Failed to generate OG image:", error);
  process.exit(1);
});
