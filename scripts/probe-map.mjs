import { chromium } from "playwright";

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const tileReqs = [];
page.on("request", (r) => {
  if (r.url().includes("cartocdn")) tileReqs.push("REQ " + r.url().slice(0, 90));
});
page.on("response", (r) => {
  if (r.url().includes("cartocdn")) tileReqs.push(`RES ${r.status()} ` + r.url().slice(30, 90));
});
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") console.log("CONSOLE:", m.text().slice(0, 200));
});
page.on("pageerror", (e) => console.log("PAGEERROR:", String(e).slice(0, 300)));

await page.goto("http://localhost:3111/areas", { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(6000);

const info = await page.evaluate(() => {
  const tiles = document.querySelectorAll(".leaflet-tile");
  const imgs = document.querySelectorAll(".leaflet-tile-pane img");
  const cont = document.querySelector(".leaflet-container");
  return {
    tileCount: tiles.length,
    imgCount: imgs.length,
    loaded: document.querySelectorAll(".leaflet-tile-loaded").length,
    containerBg: cont ? getComputedStyle(cont).backgroundColor : "none",
    firstTileSrc: imgs[0]?.getAttribute("src")?.slice(0, 90) || "none",
    firstTileStyle: imgs[0] ? getComputedStyle(imgs[0]).opacity + " / " + getComputedStyle(imgs[0]).visibility : "none",
    leafletPaneTransform: document.querySelector(".leaflet-map-pane")?.getAttribute("style")?.slice(0, 120) || "none",
  };
});
console.log(JSON.stringify(info, null, 2));
console.log("tile network events:", tileReqs.length);
console.log(tileReqs.slice(0, 6).join("\n"));
await browser.close();
