import fs from "fs/promises";
import { existsSync } from "fs";

import { discoverRouteFiles } from "./static-site-utils.js";
import {
  ABOUT_PATH,
  EN_CONTENT_ROOT,
  ROOT,
  bodyHtmlPathForRoute,
  pageJsonPathForRoute,
  parseEnglishPage,
  writeFileIfChanged
} from "./content-source-utils.js";

const force = process.argv.includes("--force");

function stableJson(value) {
  return JSON.stringify(value, null, 2);
}

async function ensureWritableContentRoot() {
  if (!existsSync(EN_CONTENT_ROOT)) return;

  const entries = await fs.readdir(EN_CONTENT_ROOT);
  if (!entries.length) return;

  if (!force) {
    throw new Error(
      "The content/en directory already exists. Re-run with `npm run migrate:content -- --force` to overwrite it."
    );
  }

  await fs.rm(EN_CONTENT_ROOT, { recursive: true, force: true });
}

function compareSharedConfig(reference, candidate, route) {
  if (stableJson(reference) !== stableJson(candidate)) {
    throw new Error(`Shared site config differs on ${route}; migration expected a single shared English baseline.`);
  }
}

async function main() {
  await ensureWritableContentRoot();

  const routeFiles = await discoverRouteFiles(ROOT, { includePt: false });
  const parsedPages = [];

  for (const routeFile of routeFiles) {
    const html = await fs.readFile(routeFile.filePath, "utf8");
    parsedPages.push(parseEnglishPage(routeFile.route, html));
  }

  const sharedAbout = parsedPages[0]?.aboutCandidate;
  if (!sharedAbout) {
    throw new Error("No English HTML routes were found to migrate.");
  }

  for (const item of parsedPages.slice(1)) {
    compareSharedConfig(sharedAbout, item.aboutCandidate, item.page.route);
  }

  let pageCount = 0;

  for (const item of parsedPages) {
    await writeFileIfChanged(`${pageJsonPathForRoute(item.page.route)}`, `${stableJson(item.page)}\n`);
    await writeFileIfChanged(bodyHtmlPathForRoute(item.page.route), item.bodyHtml);
    pageCount += 1;
  }

  await writeFileIfChanged(ABOUT_PATH, `${stableJson(sharedAbout)}\n`);

  console.log(`Migrated ${pageCount} English HTML routes into content/en/.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
