/* Screenshot harness — design verification loop. */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://localhost:3111";
const OUT = "/tmp/shots";
fs.mkdirSync(OUT, { recursive: true });

const jobs = [
  { name: "home-desktop", path: "/", w: 1440, full: true },
  { name: "home-mobile", path: "/", w: 390, full: true },
  { name: "patios-desktop", path: "/patios-paving", w: 1440, full: true },
  { name: "driveways-desktop", path: "/driveways", w: 1440, full: true },
  { name: "garden-design-desktop", path: "/garden-design", w: 1440, full: true },
  { name: "areas-desktop", path: "/areas", w: 1440, full: true },
  { name: "area-stalbans", path: "/areas/st-albans", w: 1440, full: true },
  { name: "contact-desktop", path: "/contact", w: 1440, full: true },
  { name: "privacy", path: "/privacy", w: 1440, full: false },
  { name: "portal-gate", path: "/portal", w: 1440, full: false },
  {
    name: "assessor-open",
    path: "/",
    w: 1440,
    full: false,
    act: async (page) => {
      await page.click('button[aria-label="Open the project assessor"]');
      await page.waitForTimeout(1600);
    },
  },
  {
    name: "assessor-flow",
    path: "/",
    w: 1440,
    full: false,
    act: async (page) => {
      await page.click('button[aria-label="Open the project assessor"]');
      await page.waitForTimeout(1500);
      await page.getByRole("button", { name: "Full garden redesign" }).click();
      await page.waitForTimeout(1300);
      await page.getByRole("button", { name: "1–3 months" }).click();
      await page.waitForTimeout(400);
      await page.getByRole("button", { name: "£15k–£40k" }).click();
      await page.waitForTimeout(1200);
      await page.fill('input[aria-label="Message the assessor"]', "AL1 3JE");
      await page.click('button[aria-label="Send"]');
      await page.waitForTimeout(2600);
    },
  },
  {
    name: "portal-demo-step1",
    path: "/portal",
    w: 1440,
    full: false,
    act: async (page) => {
      await page.getByRole("button", { name: /demo mode/i }).click();
      await page.waitForTimeout(600);
      await page.getByRole("button", { name: "Full garden redesign" }).click();
      await page.fill("#bw-desc", "Tired lawn with a broken concrete path, south-west facing, slight slope down from the house. Want a porcelain terrace, level lawn and a seating corner that catches the evening sun.");
      await page.waitForTimeout(400);
    },
  },
  {
    name: "portal-demo-sketch",
    path: "/portal",
    w: 1440,
    full: false,
    act: async (page) => {
      await page.getByRole("button", { name: /demo mode/i }).click();
      await page.waitForTimeout(500);
      await page.getByRole("button", { name: "Full garden redesign" }).click();
      await page.fill("#bw-desc", "Demo description for the sketch step preview.");
      await page.getByRole("button", { name: "Continue" }).click();
      await page.waitForTimeout(400);
      await page.getByRole("button", { name: "Continue" }).click();
      await page.waitForTimeout(400);
      await page.getByRole("button", { name: "Continue" }).click();
      await page.waitForTimeout(600);
      // draw on the canvas
      const canvas = page.locator("canvas");
      const box = await canvas.boundingBox();
      if (box) {
        const cx = box.x + box.width * 0.25, cy = box.y + box.height * 0.3;
        await page.mouse.move(cx, cy);
        await page.mouse.down();
        for (let i = 0; i <= 20; i++) {
          await page.mouse.move(
            box.x + box.width * (0.25 + 0.4 * Math.sin(i / 3)),
            box.y + box.height * (0.3 + i * 0.02)
          );
        }
        await page.mouse.up();
      }
      await page.waitForTimeout(400);
    },
  },
  { name: "home-tablet", path: "/", w: 768, full: false },
];

// Sandbox egress goes via a local MITM proxy — hand it to Chromium so
// browser-direct fetches (map tiles, postcodes.io) behave like production.
const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: PROXY ? [`--proxy-server=${PROXY}`] : [], // loopback bypasses by default
});
for (const j of jobs) {
  const page = await browser.newPage({
    viewport: { width: j.w, height: j.w < 500 ? 844 : 900 },
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true, // MITM proxy CA isn't in Chromium's store
  });
  try {
    if (j.full) {
      // show final state for full-page captures — reveals race the stitcher
      await page.addInitScript(() => {
        const s = document.createElement("style");
        s.textContent = ".reveal{opacity:1 !important;transform:none !important;transition:none !important}";
        document.addEventListener("DOMContentLoaded", () => document.head.appendChild(s));
      });
    }
    await page.goto(BASE + j.path, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(1200);
    // dismiss cookie banner for clean shots (except home-desktop, keep it once)
    if (j.name !== "home-desktop") {
      const btn = page.getByRole("button", { name: "Essential only" });
      if (await btn.isVisible().catch(() => false)) await btn.click();
    }
    if (j.act) await j.act(page);
    // let lazy images/tiles land on full-page shots
    if (j.full) {
      await page.evaluate(async () => {
        // pass 1: scroll through so lazy assets START loading
        await new Promise((r) => {
          let y = 0;
          const step = () => {
            y += 650;
            window.scrollTo(0, y);
            if (y < document.body.scrollHeight) setTimeout(step, 160);
            else setTimeout(r, 300);
          };
          step();
        });
        // pass 2: wait for started images, hard 7s cap (lazy strays never resolve)
        const pending = Array.from(document.images)
          .filter((i) => !i.complete)
          .map((i) => new Promise((res) => { i.onload = i.onerror = res; }));
        await Promise.race([
          Promise.all(pending),
          new Promise((res) => setTimeout(res, 7000)),
        ]);
        window.scrollTo(0, 0);
        await new Promise((res) => setTimeout(res, 600));
      });
      await page.waitForTimeout(900);
    }
    await page.screenshot({ path: `${OUT}/${j.name}.png`, fullPage: j.full });
    console.log("✓", j.name);
  } catch (e) {
    console.log("✗", j.name, String(e).slice(0, 200));
    await page.screenshot({ path: `${OUT}/${j.name}-FAIL.png` }).catch(() => {});
  }
  await page.close();
}
await browser.close();
console.log("done");
