import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const HERO_MANIFEST = path.join(ROOT, "data", "hero-manifest.json");
const KEY_FILE = path.join(os.homedir(), ".config", "monique-adv", "pixabay.key");
const TEMP_DIR = path.join(ROOT, ".cache", "pixabay");
const FALLBACK_POLICY_PATH = path.join(ROOT, "docs", "image-policy.md");

function ensureOk(condition, message) {
  if (!condition) throw new Error(message);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadKey() {
  if (process.env.PIXABAY_API_KEY) return process.env.PIXABAY_API_KEY.trim();
  if (existsSync(KEY_FILE)) return (await fs.readFile(KEY_FILE, "utf8")).trim();
  throw new Error("PIXABAY_API_KEY not found in env or ~/.config/monique-adv/pixabay.key");
}

async function fetchJson(url) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(url);
    if (response.ok) return response.json();
    if (response.status === 429 && attempt < 5) {
      const retryAfter = Number(response.headers.get("retry-after") || 0);
      const delay = retryAfter > 0 ? retryAfter * 1000 : 3000 * (attempt + 1);
      await sleep(delay);
      continue;
    }
    ensureOk(response.ok, `Pixabay request failed: ${response.status}`);
  }
  throw new Error("Pixabay request failed after retries");
}

function buildQueries(item) {
  const title = item.title.toLowerCase();
  const family = item.family.toLowerCase();
  return [
    item.query,
    `${title} brazil landscape`,
    `brazil ${family} landscape`,
    "brazil nature landscape",
    "rio de janeiro skyline brazil",
    "amazon river brazil",
    "iguazu falls brazil",
    "salvador bahia brazil",
    "pantanal brazil"
  ];
}

function sanitizeFilename(value) {
  return value.replace(/[^a-z0-9-/.]/gi, "-");
}

async function searchPixabay(apiKey, query, page = 1) {
  const url = new URL("https://pixabay.com/api/");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("image_type", "photo");
  url.searchParams.set("orientation", "horizontal");
  url.searchParams.set("safesearch", "true");
  url.searchParams.set("category", "places");
  url.searchParams.set("per_page", "50");
  url.searchParams.set("page", String(page));
  return fetchJson(url.toString());
}

async function download(url, destination) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(url);
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.writeFile(destination, Buffer.from(arrayBuffer));
      return;
    }
    if (response.status === 429 && attempt < 5) {
      const retryAfter = Number(response.headers.get("retry-after") || 0);
      const delay = retryAfter > 0 ? retryAfter * 1000 : 3000 * (attempt + 1);
      await sleep(delay);
      continue;
    }
    ensureOk(response.ok, `Image download failed: ${response.status}`);
  }
  throw new Error("Image download failed after retries");
}

async function createGeneratedFallback(destination, title) {
  const python = `
from PIL import Image, ImageDraw
from pathlib import Path
dest = Path(r"${destination}")
dest.parent.mkdir(parents=True, exist_ok=True)
img = Image.new("RGB", (1600, 900), "#103f24")
draw = ImageDraw.Draw(img)
draw.polygon([(0,900),(240,460),(420,600),(640,360),(920,640),(1100,420),(1400,740),(1600,560),(1600,900)], fill="#d4af37")
draw.ellipse((1140,110,1320,290), fill="#f8f6f1")
draw.rectangle((0,0,1600,900), outline="#c9a96e", width=24)
img.save(dest, "WEBP", quality=70, method=6)
`;
  const result = spawnSync("python3", ["-c", python], { cwd: ROOT, encoding: "utf8" });
  ensureOk(result.status === 0, result.stderr || "Fallback generation failed");
}

async function writeFallbackPolicy() {
  await fs.writeFile(
    FALLBACK_POLICY_PATH,
    `# Hero Image Policy

Each page is assigned its own hero asset path under \`assets/images/heroes/<family>/<slug>.webp\`.

Fallback order:

1. Search Pixabay with the page-specific hero query.
2. Retry with the page title plus \`Brazil landscape\`.
3. Retry with the family plus \`Brazil landscape\`.
4. Retry using curated Brazil destination and nature queries.
5. If Pixabay results are weak, repetitive, or exhausted, generate a branded scenic fallback so the route still ships with a unique hero path and no missing image.

This keeps the site buildable while preserving manual override room for later image swaps.
`,
    "utf8"
  );
}

async function main() {
  const refresh = process.argv.includes("--refresh");
  const apiKey = await loadKey();
  const manifest = JSON.parse(await fs.readFile(HERO_MANIFEST, "utf8"));
  const usedIds = new Set();
  await fs.mkdir(TEMP_DIR, { recursive: true });
  await writeFallbackPolicy();

  for (const item of manifest) {
    const destination = path.join(ROOT, item.path.replace(/^\//, ""));
    if (existsSync(destination) && !refresh) continue;

    const queries = buildQueries(item);
    let selected = null;
    for (const query of queries) {
      for (let page = 1; page <= 2; page += 1) {
        const payload = await searchPixabay(apiKey, query, page);
        const hit = (payload.hits || []).find((candidate) => !usedIds.has(candidate.id));
        if (hit) {
          selected = hit;
          break;
        }
      }
      if (selected) break;
    }

    if (selected) {
      usedIds.add(selected.id);
      const tempFile = path.join(TEMP_DIR, `${sanitizeFilename(String(selected.id))}.tmp`);
      await download(selected.largeImageURL || selected.webformatURL, tempFile);
      const result = spawnSync(
        "python3",
        [path.join("scripts", "convert_to_webp.py"), tempFile, destination],
        { cwd: ROOT, encoding: "utf8" }
      );
      ensureOk(result.status === 0, result.stderr || `Conversion failed for ${item.title}`);
      await fs.rm(tempFile, { force: true });
      console.log(`Fetched ${item.title} -> ${item.path}`);
    } else {
      await createGeneratedFallback(destination, item.title);
      console.log(`Fallback generated for ${item.title}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
