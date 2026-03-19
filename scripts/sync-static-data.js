import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";

import {
  buildFormMapMarkdown,
  discoverRouteFiles,
  extractFormActions,
  extractPageData,
  wordCount
} from "./static-site-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

function mainContentWordCount(html) {
  const articleMatch = html.match(/<article class="content-column">([\s\S]*?)<\/article>\s*<aside class="sidebar-column">/i);
  const content = articleMatch ? articleMatch[1] : html.match(/<main[\s\S]*?<\/main>/i)?.[0] || html;
  return wordCount(content);
}

function buildFormMapEntry(route, title, endpoint) {
  return {
    route,
    title,
    endpoint
  };
}

async function sync404(routeFilesByRoute) {
  const legal404 = routeFilesByRoute.get("/legal/404/");
  if (!legal404 || !existsSync(legal404.filePath)) return;
  const html = await fs.readFile(legal404.filePath, "utf8");
  await writeFile(path.join(ROOT, "404.html"), html);
}

async function main() {
  const routeFiles = await discoverRouteFiles(ROOT);
  const routeFilesByRoute = new Map(routeFiles.map((item) => [item.route, item]));
  const searchIndex = [];
  const buildReport = [];
  const formMap = [];

  for (const page of routeFiles) {
    const html = await fs.readFile(page.filePath, "utf8");
    const pageData = extractPageData(page.route, html);

    if (!pageData.noindex) {
      searchIndex.push(pageData);
    }

    buildReport.push({
      route: page.route,
      title: pageData.title,
      wordCount: mainContentWordCount(html)
    });

    const formActions = extractFormActions(html).filter((action) => /formspree\.io\/f\//i.test(action));
    for (const endpoint of formActions) {
      formMap.push(buildFormMapEntry(page.route, pageData.title, endpoint));
    }
  }

  await sync404(routeFilesByRoute);
  await writeFile(path.join(ROOT, "data", "search-index.json"), JSON.stringify(searchIndex, null, 2));
  await writeFile(path.join(ROOT, "data", "build-report.json"), JSON.stringify(buildReport, null, 2));
  await writeFile(path.join(ROOT, "data", "formspree-map.json"), JSON.stringify(formMap, null, 2));
  await writeFile(path.join(ROOT, "docs", "formspree-map.md"), buildFormMapMarkdown(formMap));

  const searchCount = searchIndex.length;
  const formCount = formMap.length;
  console.log(`Synced static site data for ${routeFiles.length} HTML routes (${searchCount} search entries, ${formCount} forms).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
