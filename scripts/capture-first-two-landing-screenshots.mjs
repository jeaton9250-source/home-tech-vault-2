/**
 * Recapture device-inventory + home-tech-inventory SEO screenshots from demo.
 * Usage: node scripts/capture-first-two-landing-screenshots.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = "https://www.hometechvault.com";
const OUT = path.join(process.cwd(), "public/seo/screenshots");

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

async function hideDemoBanner(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      const text = el.textContent?.trim() ?? "";
      if (
        text.includes("exploring the Morgan Household") &&
        text.length < 160 &&
        el.children.length <= 4
      ) {
        el.style.display = "none";
      }
    }
  });
}

async function shot(page, file) {
  await hideDemoBanner(page);
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(OUT, file),
    type: "png",
    fullPage: false,
    clip: { x: 0, y: 0, width: 1280, height: 900 },
  });
  console.log(`wrote ${file}`);
}

async function gotoDemo(page, url, waitText) {
  await page.goto(`${BASE}${url}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await dismissOverlays(page);
  await page.waitForTimeout(900);
  try {
    await page.getByText(waitText, { exact: false }).first().waitFor({
      timeout: 15000,
    });
  } catch {
    console.warn(`waitText missing: ${waitText}`);
  }
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

  // device-inventory: Device directory
  await gotoDemo(page, "/devices", "Devices");
  await shot(page, "device-directory.png");

  // device-inventory: Device profile
  await gotoDemo(page, "/devices/demo-air-purifier", "Air Purifier");
  // Fall back to frame TV if air purifier route differs
  if (!(await page.getByText("Air Purifier", { exact: false }).count())) {
    await gotoDemo(page, "/devices/demo-samsung-frame", "Samsung");
  }
  await shot(page, "device-profile.png");

  // device-inventory: Quick add menu
  await gotoDemo(page, "/devices", "Devices");
  const quickAdd = page.getByRole("button", { name: /Quick Add/i });
  await quickAdd.first().click();
  await page.waitForTimeout(500);
  await shot(page, "quick-add.png");
  await page.keyboard.press("Escape");

  // home-tech-inventory: Household overview
  await gotoDemo(page, "/dashboard", "Home Pulse");
  await shot(page, "home-tech-overview.png");

  // home-tech-inventory: Filtered inventory (open location filter if present)
  await gotoDemo(page, "/devices", "Devices");
  const locationFilter = page
    .getByRole("button", { name: /Location|Room|All rooms|Filter/i })
    .first();
  if (await locationFilter.count()) {
    try {
      await locationFilter.click({ timeout: 2000 });
      await page.waitForTimeout(400);
    } catch {
      // ignore
    }
  } else {
    // Try combobox / select-looking controls
    const filterChip = page.getByText(/Bedroom|Living Room|Kitchen/i).first();
    if (await filterChip.count()) {
      try {
        await filterChip.click({ timeout: 1500 });
      } catch {
        // ignore
      }
    }
  }
  await shot(page, "home-tech-filtered.png");

  // home-tech-inventory: Family access
  await gotoDemo(page, "/family", "Family");
  await shot(page, "home-tech-family.png");

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
