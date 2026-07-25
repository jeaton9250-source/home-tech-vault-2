/**
 * Capture viewport-sized SEO landing screenshots from the public demo.
 * Usage: node scripts/capture-demo-seo-screenshots.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = "https://www.hometechvault.com";
const OUT = path.join(process.cwd(), "public/seo/screenshots");

const SHOTS = [
  { file: "warranty-center.png", url: "/warranties", waitText: "Protected Value" },
  { file: "documents-library.png", url: "/documents", waitText: "Documents" },
  { file: "network-overview.png", url: "/network", waitText: "Network" },
  { file: "family-access.png", url: "/family", waitText: "Family" },
  { file: "devices-inventory.png", url: "/devices", waitText: "Devices" },
  {
    file: "device-detail.png",
    url: "/devices/demo-samsung-frame",
    waitText: "Warranty Information",
  },
  {
    file: "device-documents.png",
    url: "/devices/demo-samsung-frame",
    waitText: "Documents",
    afterLoad: async (page) => {
      const tab = page.getByRole("tab", { name: /^Documents$/i });
      if (await tab.count()) {
        await tab.first().click();
        await page.waitForTimeout(600);
        return;
      }
      const link = page.getByRole("link", { name: /^Documents$/i });
      if (await link.count()) {
        await link.first().click();
        await page.waitForTimeout(600);
      }
      const button = page.getByRole("button", { name: /^Documents$/i });
      if (await button.count()) {
        await button.first().click();
        await page.waitForTimeout(600);
      }
    },
  },
  {
    file: "device-activity.png",
    url: "/devices/demo-samsung-frame",
    waitText: "Activity",
    afterLoad: async (page) => {
      const tab = page.getByRole("tab", { name: /^Activity$/i });
      if (await tab.count()) {
        await tab.first().click();
        await page.waitForTimeout(600);
        return;
      }
      const button = page.getByRole("button", { name: /^Activity$/i });
      if (await button.count()) {
        await button.first().click();
        await page.waitForTimeout(600);
      }
    },
  },
  { file: "home-dashboard.png", url: "/dashboard", waitText: "Home Pulse" },
  { file: "home-rooms.png", url: "/home", waitText: "Living Room" },
  { file: "pricing-plans.png", url: "/pricing", waitText: "Pricing" },
  { file: "trust-security.png", url: "/trust", waitText: "Trust" },
];

async function enableDemo(page) {
  await page.addInitScript(() => {
    localStorage.setItem("home-tech-vault-demo", "true");
    localStorage.setItem(
      "home-tech-vault-demo-data-version",
      "morgan-household-v5"
    );
    localStorage.setItem("home-tech-vault-demo-welcome-seen", "true");
    localStorage.setItem("home-tech-vault-demo-tour-completed", "true");
  });
}

async function dismissOverlays(page) {
  for (const label of ["Explore Freely", "Skip", "Got it", "Close"]) {
    const btn = page.getByRole("button", { name: label });
    if (await btn.count()) {
      try {
        await btn.first().click({ timeout: 1500 });
      } catch {
        // ignore
      }
    }
  }
}

async function capture(page, shot) {
  const dest = path.join(OUT, shot.file);
  await page.goto(`${BASE}${shot.url}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await dismissOverlays(page);
  await page.waitForTimeout(1000);

  try {
    await page.getByText(shot.waitText, { exact: false }).first().waitFor({
      timeout: 15000,
    });
  } catch {
    console.warn(`waitText not found for ${shot.file}: ${shot.waitText}`);
  }

  if (shot.afterLoad) {
    await shot.afterLoad(page);
  }

  await page.waitForTimeout(500);

  // Hide sticky demo banner so product UI fills the frame.
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      const text = el.textContent?.trim() ?? "";
      if (
        text.startsWith("Interactive Demo") &&
        text.length < 120 &&
        el.children.length <= 3
      ) {
        el.style.display = "none";
      }
    }
  });

  // Viewport crop — readable inside SEO cards with object-contain.
  await page.screenshot({
    path: dest,
    type: "png",
    fullPage: false,
    clip: { x: 0, y: 0, width: 1280, height: 900 },
  });

  console.log(`wrote ${shot.file}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await enableDemo(page);

  await page.goto(`${BASE}/demo`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.setItem("home-tech-vault-demo", "true");
    localStorage.setItem(
      "home-tech-vault-demo-data-version",
      "morgan-household-v5"
    );
    localStorage.setItem("home-tech-vault-demo-welcome-seen", "true");
    localStorage.setItem("home-tech-vault-demo-tour-completed", "true");
  });

  for (const shot of SHOTS) {
    await capture(page, shot);
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
