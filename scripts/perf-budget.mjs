#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DOT_NEXT = path.join(ROOT, ".next");

const MAX_TOTAL_JS_BYTES = Number(process.env.PERF_MAX_TOTAL_JS_BYTES || 1_200_000);
const MAX_SINGLE_JS_BYTES = Number(process.env.PERF_MAX_SINGLE_JS_BYTES || 350_000);
const MAX_JS_ASSET_COUNT = Number(process.env.PERF_MAX_JS_ASSET_COUNT || 80);
const MANIFEST_FILES = [
  "build-manifest.json",
  "app-build-manifest.json",
  "react-loadable-manifest.json",
];

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function readJsonIfExists(filePath) {
  if (!(await exists(filePath))) {
    return null;
  }

  try {
    return await readJson(filePath);
  } catch {
    return null;
  }
}

function collectJsEntries(value, files) {
  if (typeof value === "string") {
    const clean = value.split("?")[0];
    if (clean.endsWith(".js")) {
      files.add(clean);
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectJsEntries(item, files);
    }
    return;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      collectJsEntries(item, files);
    }
  }
}

function resolveAssetPath(assetPath) {
  const trimmed = assetPath.split("?")[0].replace(/^\/+/, "");
  if (!trimmed) return null;

  if (trimmed.startsWith("_next/")) {
    return path.join(DOT_NEXT, trimmed.slice("_next/".length));
  }

  return path.join(DOT_NEXT, trimmed);
}

async function walkJsFiles(dir, output = []) {
  if (!(await exists(dir))) {
    return output;
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkJsFiles(absolute, output);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".js")) {
      continue;
    }

    output.push(absolute);
  }

  return output;
}

async function main() {
  if (!(await exists(DOT_NEXT))) {
    throw new Error("Missing .next build output. Run `npm run build` before `npm run perf:budget`.");
  }

  const files = new Set();

  for (const manifestFile of MANIFEST_FILES) {
    const manifestPath = path.join(DOT_NEXT, manifestFile);
    const manifest = await readJsonIfExists(manifestPath);
    if (!manifest) continue;
    collectJsEntries(manifest, files);
  }

  if (files.size === 0) {
    const chunkFiles = await walkJsFiles(path.join(DOT_NEXT, "static", "chunks"));
    for (const absolutePath of chunkFiles) {
      const rel = path.relative(DOT_NEXT, absolutePath).replace(/\\/g, "/");
      files.add(rel);
    }
  }

  const assets = [];
  for (const assetPath of files) {
    const fullPath = resolveAssetPath(assetPath);
    if (!fullPath) continue;
    if (!(await exists(fullPath))) continue;
    const stat = await fs.stat(fullPath);
    const printablePath = path.relative(DOT_NEXT, fullPath).replace(/\\/g, "/");
    assets.push({ file: printablePath, size: stat.size });
  }

  const totalJsBytes = assets.reduce((sum, asset) => sum + asset.size, 0);
  const largestAsset = [...assets].sort((a, b) => b.size - a.size)[0];
  const failures = [];

  if (assets.length === 0) {
    failures.push("No JS assets detected. Manifest parsing may be out of date for this Next.js version.");
  }

  if (assets.length > MAX_JS_ASSET_COUNT) {
    failures.push(`JS asset count ${assets.length} > limit ${MAX_JS_ASSET_COUNT}`);
  }

  if (totalJsBytes > MAX_TOTAL_JS_BYTES) {
    failures.push(`Total JS bytes ${totalJsBytes} > limit ${MAX_TOTAL_JS_BYTES}`);
  }

  if (largestAsset && largestAsset.size > MAX_SINGLE_JS_BYTES) {
    failures.push(
      `Largest JS asset ${largestAsset.file} is ${largestAsset.size} bytes > limit ${MAX_SINGLE_JS_BYTES}`
    );
  }

  console.log("Performance budget summary");
  console.log(`- JS assets: ${assets.length}`);
  console.log(`- Total JS bytes: ${totalJsBytes}`);
  if (largestAsset) {
    console.log(`- Largest JS asset: ${largestAsset.file} (${largestAsset.size} bytes)`);
  }

  if (failures.length > 0) {
    console.error("\nBudget failures:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("\nAll performance budgets passed.");
}

main().catch((error) => {
  console.error("perf:budget failed");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
