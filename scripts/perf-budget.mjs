#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DOT_NEXT = path.join(ROOT, ".next");

const MAX_TOTAL_JS_BYTES = Number(process.env.PERF_MAX_TOTAL_JS_BYTES || 1_200_000);
const MAX_SINGLE_JS_BYTES = Number(process.env.PERF_MAX_SINGLE_JS_BYTES || 350_000);
const MAX_JS_ASSET_COUNT = Number(process.env.PERF_MAX_JS_ASSET_COUNT || 80);

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

async function main() {
  const buildManifestPath = path.join(DOT_NEXT, "build-manifest.json");
  if (!(await exists(buildManifestPath))) {
    throw new Error(
      "Missing .next/build-manifest.json. Run `npm run build` before `npm run perf:budget`."
    );
  }

  const buildManifest = await readJson(buildManifestPath);
  const pageMap = buildManifest.pages ?? {};
  const files = new Set();

  for (const entry of Object.values(pageMap)) {
    if (!Array.isArray(entry)) continue;
    for (const item of entry) {
      if (typeof item === "string" && item.endsWith(".js")) {
        files.add(item);
      }
    }
  }

  const assets = [];
  for (const relPath of files) {
    const normalized = relPath.replace(/^\//, "");
    const fullPath = path.join(DOT_NEXT, normalized);
    if (!(await exists(fullPath))) continue;
    const stat = await fs.stat(fullPath);
    assets.push({ file: relPath, size: stat.size });
  }

  const totalJsBytes = assets.reduce((sum, asset) => sum + asset.size, 0);
  const largestAsset = assets.sort((a, b) => b.size - a.size)[0];
  const failures = [];

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
