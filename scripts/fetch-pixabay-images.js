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
const SEARCH_CACHE = new Map();

const BRAZIL_QUERY_POOLS = {
  general: [
    "rio de janeiro sugarloaf mountain brazil",
    "rio de janeiro copacabana brazil",
    "rio de janeiro christ the redeemer brazil",
    "sao paulo skyline brazil",
    "sao paulo avenida paulista brazil",
    "brasilia national congress brazil",
    "brasilia cathedral brazil",
    "salvador pelourinho bahia brazil",
    "paraty rio de janeiro brazil",
    "ouro preto minas gerais brazil",
    "iguazu falls brazil",
    "florianopolis brazil coastline",
    "curitiba brazil skyline",
    "fernando de noronha brazil",
    "lencois maranhenses brazil",
    "amazon river brazil",
    "pantanal brazil",
    "bonito mato grosso do sul brazil",
    "chapada diamantina brazil",
    "jericoacoara ceara brazil"
  ],
  civic: [
    "brasilia skyline brazil",
    "brasilia national congress brazil",
    "brasilia cathedral brazil",
    "sao paulo skyline brazil",
    "rio de janeiro downtown brazil",
    "curitiba skyline brazil",
    "belo horizonte skyline brazil",
    "salvador pelourinho bahia brazil",
    "porto alegre skyline brazil",
    "recife waterfront brazil"
  ],
  coastal: [
    "rio de janeiro copacabana brazil",
    "rio de janeiro ipanema brazil",
    "florianopolis brazil coastline",
    "fernando de noronha brazil",
    "porto de galinhas pernambuco brazil",
    "maceio alagoas brazil",
    "joao pessoa paraiba brazil",
    "fortaleza ceara brazil beach",
    "vitoria espirito santo brazil coast",
    "ilha grande brazil"
  ],
  nature: [
    "iguazu falls brazil",
    "amazon rainforest brazil",
    "amazon river brazil",
    "pantanal brazil",
    "lencois maranhenses brazil",
    "bonito mato grosso do sul brazil",
    "chapada dos veadeiros brazil",
    "chapada diamantina brazil",
    "jalapao tocantins brazil",
    "serra gaucha brazil landscape"
  ],
  heritage: [
    "salvador pelourinho bahia brazil",
    "paraty rio de janeiro brazil",
    "ouro preto minas gerais brazil",
    "olinda pernambuco brazil",
    "manaus teatro amazonas brazil",
    "sao luis maranhao brazil historic center",
    "tiradentes minas gerais brazil"
  ],
  north: [
    "manaus amazon river brazil",
    "alter do chao para brazil",
    "belem para waterfront brazil",
    "amazon rainforest brazil",
    "rio negro amazonas brazil",
    "jalapao tocantins brazil"
  ],
  northeast: [
    "salvador pelourinho bahia brazil",
    "recife pernambuco brazil",
    "olinda pernambuco brazil",
    "fortaleza ceara brazil beach",
    "jericoacoara ceara brazil",
    "lencois maranhenses brazil",
    "fernando de noronha brazil",
    "porto de galinhas pernambuco brazil",
    "maceio alagoas brazil",
    "joao pessoa paraiba brazil"
  ],
  centralWest: [
    "brasilia national congress brazil",
    "brasilia cathedral brazil",
    "brasilia skyline brazil",
    "pantanal brazil",
    "bonito mato grosso do sul brazil",
    "chapada dos veadeiros brazil",
    "cuiaba brazil skyline",
    "goiania brazil skyline"
  ],
  southeast: [
    "rio de janeiro sugarloaf mountain brazil",
    "rio de janeiro copacabana brazil",
    "sao paulo skyline brazil",
    "sao paulo avenida paulista brazil",
    "ouro preto minas gerais brazil",
    "belo horizonte skyline brazil",
    "vitoria espirito santo brazil coast",
    "paraty rio de janeiro brazil"
  ],
  south: [
    "florianopolis brazil coastline",
    "curitiba brazil skyline",
    "porto alegre skyline brazil",
    "gramado brazil",
    "foz do iguacu brazil",
    "serra gaucha brazil landscape",
    "blumenau santa catarina brazil",
    "itaimbezinho canyon brazil"
  ]
};

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

function stableHash(value) {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function rotate(values, seed) {
  if (!values.length) return [];
  const offset = seed % values.length;
  return values.slice(offset).concat(values.slice(0, offset));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function includesAny(value, terms) {
  return terms.some((term) => value.includes(term));
}

function queriesForRegion(item) {
  const key = item.key.toLowerCase();
  const route = item.route.toLowerCase();
  if (key === "brazil-northeast" || route.includes("/northeast/")) return BRAZIL_QUERY_POOLS.northeast;
  if (key === "brazil-central-west" || route.includes("/central-west/")) return BRAZIL_QUERY_POOLS.centralWest;
  if (key === "brazil-southeast" || route.includes("/southeast/")) return BRAZIL_QUERY_POOLS.southeast;
  if (key === "brazil-south" || route.includes("/south/")) return BRAZIL_QUERY_POOLS.south;
  if (key === "brazil-north" || route.includes("/north/")) return BRAZIL_QUERY_POOLS.north;
  return [];
}

function buildQueries(item) {
  const key = item.key.toLowerCase();
  const family = item.family.toLowerCase();
  const pools = [queriesForRegion(item)];

  if (["about", "legal", "process", "services", "insights"].includes(family)) {
    pools.push(BRAZIL_QUERY_POOLS.civic);
  }

  if (
    includesAny(key, [
      "culture",
      "festivals",
      "cuisine",
      "events",
      "story",
      "stories",
      "mission",
      "values",
      "clients",
      "testimonials",
      "blog",
      "guides"
    ])
  ) {
    pools.push(BRAZIL_QUERY_POOLS.heritage, BRAZIL_QUERY_POOLS.coastal);
  }

  if (
    includesAny(key, [
      "home",
      "consultation",
      "brazil",
      "living",
      "quality",
      "cost",
      "housing",
      "healthcare",
      "education",
      "safety",
      "faqs",
      "north",
      "northeast",
      "central-west",
      "southeast",
      "south"
    ])
  ) {
    pools.push(BRAZIL_QUERY_POOLS.nature, BRAZIL_QUERY_POOLS.coastal);
  }

  if (
    includesAny(key, [
      "cities",
      "municipalities",
      "directory",
      "search",
      "profile",
      "governance",
      "compliance",
      "standards",
      "regulatory",
      "payment",
      "privacy",
      "cookies",
      "terms",
      "gdpr",
      "lgpd",
      "accessibility",
      "disclaimer",
      "404"
    ])
  ) {
    pools.push(BRAZIL_QUERY_POOLS.civic);
  }

  const ordered = unique([...pools.flat(), ...BRAZIL_QUERY_POOLS.general]);
  return rotate(ordered, stableHash(item.key));
}

function sanitizeFilename(value) {
  return value.replace(/[^a-z0-9-/.]/gi, "-");
}

async function searchPixabay(apiKey, query, page = 1) {
  const cacheKey = `${query}::${page}`;
  if (SEARCH_CACHE.has(cacheKey)) return SEARCH_CACHE.get(cacheKey);
  const url = new URL("https://pixabay.com/api/");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("image_type", "photo");
  url.searchParams.set("orientation", "horizontal");
  url.searchParams.set("safesearch", "true");
  url.searchParams.set("category", "places");
  url.searchParams.set("per_page", "50");
  url.searchParams.set("page", String(page));
  const response = fetchJson(url.toString());
  SEARCH_CACHE.set(cacheKey, response);
  return response;
}

async function download(url, destination) {
  if (existsSync(destination)) return;
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

function orderedCandidates(hits, seed) {
  return rotate(hits, seed);
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

1. Start from curated Brazil-only query pools covering cityscapes, capitals, coastlines, heritage sites, and nature landmarks.
2. Add region-specific Brazil pools for North, Northeast, Central-West, Southeast, and South routes.
3. Rotate query order deterministically per page so the site does not collapse onto the same landmark.
4. Prefer unused Brazil photos first, then reuse a verified Brazil hit before considering any synthetic fallback.
5. Only generate a branded scenic fallback if Pixabay has no usable Brazil-place result at all.

This keeps every hero grounded in Brazil while preserving manual override room for later swaps.
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
    let reusable = null;
    for (const query of queries) {
      for (let page = 1; page <= 2; page += 1) {
        const payload = await searchPixabay(apiKey, query, page);
        const candidates = orderedCandidates(payload.hits || [], stableHash(`${item.key}:${query}:${page}`));
        const hit = candidates.find((candidate) => !usedIds.has(candidate.id));
        if (hit) {
          selected = hit;
          break;
        }
        if (!reusable && candidates.length) reusable = candidates[0];
      }
      if (selected) break;
    }

    if (!selected) selected = reusable;

    if (selected) {
      usedIds.add(selected.id);
      const tempFile = path.join(TEMP_DIR, `${sanitizeFilename(String(selected.id))}.img`);
      await download(selected.largeImageURL || selected.webformatURL, tempFile);
      const result = spawnSync(
        "python3",
        [path.join("scripts", "convert_to_webp.py"), tempFile, destination],
        { cwd: ROOT, encoding: "utf8" }
      );
      ensureOk(result.status === 0, result.stderr || `Conversion failed for ${item.title}`);
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
