import fs from "fs/promises";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

import {
  buildHeroAssignments,
  findHeroSourceById,
  HERO_POLICY_MARKDOWN
} from "./hero-seo-utils.js";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const MANIFEST_PATH = path.join(ROOT, "data", "hero-manifest.json");
const POLICY_PATH = path.join(ROOT, "docs", "image-policy.md");
const CACHE_DIR = path.join(ROOT, ".cache", "hero-library");

function filePathFromAsset(assetPath) {
  return path.join(ROOT, assetPath.replace(/^\//, ""));
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function cachePathForSource(source) {
  const sourceUrl = new URL(source.url);
  const ext = path.extname(sourceUrl.pathname) || ".img";
  return path.join(CACHE_DIR, `${source.id}${ext}`);
}

async function downloadSourceImage(source, refresh = false) {
  const cachePath = cachePathForSource(source);
  if (!refresh && (await fileExists(cachePath))) {
    return cachePath;
  }

  const response = await fetch(source.url, {
    headers: {
      "user-agent": "ImmigrateToBrazil-HeroSync/1.0"
    },
    signal: AbortSignal.timeout(30000)
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${source.id}: ${response.status} ${response.statusText}`);
  }

  await fs.mkdir(path.dirname(cachePath), { recursive: true });
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(cachePath, buffer);
  return cachePath;
}

async function copyPreviousAsset(previous, outputPath) {
  if (!previous?.path) return false;
  const previousPath = filePathFromAsset(previous.path);
  if (!(await fileExists(previousPath))) return false;
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.copyFile(previousPath, outputPath);
  return true;
}

function convertToWebp(sourcePath, outputPath) {
  execFileSync("python3", ["scripts/convert_to_webp.py", sourcePath, outputPath], {
    cwd: ROOT,
    stdio: "inherit"
  });
}

async function loadManifest() {
  return JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8"));
}

export async function syncHeroAssets(options = {}) {
  const refresh = Boolean(options.refresh);
  const manifest = options.manifest || (await loadManifest());
  const previousManifest = options.previousManifest || manifest;
  const assignments = options.assignments || buildHeroAssignments(manifest);
  const previousByKey = new Map(previousManifest.map((item) => [item.key, item]));
  const unavailableSources = new Map();

  await fs.mkdir(CACHE_DIR, { recursive: true });

  for (const assignment of assignments) {
    const outputPath = filePathFromAsset(assignment.path);
    if (!refresh && (await fileExists(outputPath))) {
      continue;
    }

    const previous = previousByKey.get(assignment.key);
    const source = findHeroSourceById(assignment.sourceId);
    if (source) {
      if (!unavailableSources.has(source.id)) {
        try {
          const downloadedSource = await downloadSourceImage(source, refresh);
          convertToWebp(downloadedSource, outputPath);
          continue;
        } catch (error) {
          unavailableSources.set(source.id, error);
        }
      }

      const copied = await copyPreviousAsset(previous, outputPath);
      if (copied) {
        continue;
      }
      throw unavailableSources.get(source.id);
    }

    if (await copyPreviousAsset(previous, outputPath)) {
      continue;
    }

    throw new Error(`No source image available for hero ${assignment.key}`);
  }

  await fs.writeFile(POLICY_PATH, HERO_POLICY_MARKDOWN, "utf8");
  return assignments;
}

async function main() {
  const refresh = process.argv.includes("--refresh");
  await syncHeroAssets({ refresh });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
