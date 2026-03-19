import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  discoverRouteFiles,
  extractFormActions,
  extractLocalRefs,
  extractPageData,
  normalizeUrlForLookup,
  resolveLocalPath
} from "./static-site-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function compareStringSets(actual, expected) {
  if (actual.length !== expected.length) return false;
  return actual.every((value, index) => value === expected[index]);
}

function compareFormEntries(actual, expected) {
  if (actual.length !== expected.length) return false;
  return actual.every(
    (entry, index) =>
      entry.route === expected[index].route &&
      entry.title === expected[index].title &&
      entry.endpoint === expected[index].endpoint
  );
}

async function readJson(filePath, failures) {
  if (!existsSync(filePath)) {
    failures.push(`Missing file: ${path.relative(ROOT, filePath)}`);
    return null;
  }

  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    failures.push(`Invalid JSON in ${path.relative(ROOT, filePath)}: ${error.message}`);
    return null;
  }
}

async function main() {
  const routeFiles = await discoverRouteFiles(ROOT);
  const failures = [];
  const titleMap = new Map();
  const descriptionMap = new Map();
  const expectedSearchRoutes = [];
  const expectedFormMap = [];
  let legal404Html = "";

  for (const page of routeFiles) {
    const html = await fs.readFile(page.filePath, "utf8");
    const pageData = extractPageData(page.route, html);
    const description = pageData.summary;
    const h1Count = (html.match(/<h1\b/gi) || []).length;
    const mainCount = (html.match(/<main\b/gi) || []).length;

    if (!pageData.browserTitle) failures.push(`Missing <title>: ${page.route}`);
    if (!description) failures.push(`Missing meta description: ${page.route}`);
    if (h1Count !== 1) failures.push(`Expected exactly one H1 on ${page.route}, found ${h1Count}`);
    if (mainCount !== 1) failures.push(`Expected exactly one <main> on ${page.route}, found ${mainCount}`);
    if (!html.includes("application/ld+json")) failures.push(`Missing JSON-LD schema: ${page.route}`);

    if (titleMap.has(pageData.browserTitle)) failures.push(`Duplicate title: ${pageData.browserTitle}`);
    if (descriptionMap.has(description)) failures.push(`Duplicate description: ${description}`);
    titleMap.set(pageData.browserTitle, page.route);
    descriptionMap.set(description, page.route);

    if (!pageData.noindex) {
      expectedSearchRoutes.push(page.route);
    }

    const formActions = extractFormActions(html).filter((action) => /formspree\.io\/f\//i.test(action));
    for (const endpoint of formActions) {
      expectedFormMap.push({
        route: page.route,
        title: pageData.title,
        endpoint
      });
    }

    const localRefs = extractLocalRefs(html);
    for (const ref of localRefs) {
      const lookupPath = normalizeUrlForLookup(ref, page.route);
      if (!lookupPath) continue;
      const localPath = resolveLocalPath(ROOT, lookupPath);
      if (localPath && !existsSync(localPath)) {
        failures.push(`Broken local reference ${ref} on ${page.route}`);
      }
    }

    if (page.route === "/legal/404/") {
      legal404Html = html;
    }
  }

  const searchIndexPath = path.join(ROOT, "data", "search-index.json");
  const formMapPath = path.join(ROOT, "data", "formspree-map.json");
  const buildReportPath = path.join(ROOT, "data", "build-report.json");
  const formMapMarkdownPath = path.join(ROOT, "docs", "formspree-map.md");
  const root404Path = path.join(ROOT, "404.html");

  const searchIndex = await readJson(searchIndexPath, failures);
  const formMap = await readJson(formMapPath, failures);
  await readJson(buildReportPath, failures);

  if (!existsSync(formMapMarkdownPath)) {
    failures.push("Missing docs/formspree-map.md");
  }

  if (searchIndex) {
    const actualSearchRoutes = [...new Set(searchIndex.map((item) => item.route))].sort();
    const expected = [...new Set(expectedSearchRoutes)].sort();
    if (!compareStringSets(actualSearchRoutes, expected)) {
      failures.push("Search index is out of sync. Run `npm run sync:data`.");
    }
  }

  if (formMap) {
    const actualFormEntries = [...formMap]
      .map((item) => ({
        route: item.route,
        title: item.title,
        endpoint: item.endpoint
      }))
      .sort((a, b) => `${a.route}|${a.endpoint}`.localeCompare(`${b.route}|${b.endpoint}`));
    const expected = [...expectedFormMap].sort((a, b) => `${a.route}|${a.endpoint}`.localeCompare(`${b.route}|${b.endpoint}`));
    if (!compareFormEntries(actualFormEntries, expected)) {
      failures.push("Formspree map is out of sync. Run `npm run sync:data`.");
    }
  }

  if (!existsSync(root404Path)) {
    failures.push("Missing root 404.html");
  } else if (legal404Html) {
    const root404Html = await fs.readFile(root404Path, "utf8");
    if (root404Html !== legal404Html) {
      failures.push("Root 404.html is out of sync with /legal/404/. Run `npm run sync:data`.");
    }
  }

  if (failures.length) {
    console.error("Validation failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log(`Validation passed for ${routeFiles.length} route HTML files.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
