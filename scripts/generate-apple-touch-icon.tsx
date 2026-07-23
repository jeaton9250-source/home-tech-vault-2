import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { ImageResponse } from "next/og";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(scriptDir, "..");
const outputPath = join(rootDir, "public/brand/apple-touch-icon.png");

async function main() {
  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#183B56",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "#3BAF75",
          }}
        />
        <div
          style={{
            color: "white",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.04em",
          }}
        >
          HT
        </div>
      </div>
    ),
    {
      width: 180,
      height: 180,
    }
  );

  const buffer = Buffer.from(await response.arrayBuffer());

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, buffer);

  console.log(`Wrote ${outputPath} (${buffer.length} bytes)`);
}

main().catch((error) => {
  console.error("Failed to generate apple touch icon:", error);
  process.exit(1);
});
