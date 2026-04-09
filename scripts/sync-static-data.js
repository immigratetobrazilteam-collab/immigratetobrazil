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
import { normalizeRouteHtmlFiles } from "./html-normalize-utils.js";
import { buildSitemapArtifacts, localeForRoute, resolveLastmodByFile } from "./sitemap-utils.js";

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

function baseRouteFor(route) {
  return route.startsWith("/pt-br/") ? route.replace(/^\/pt-br/, "") || "/" : route;
}

async function sync404(routeFilesByRoute) {
  const legal404 = routeFilesByRoute.get("/legal/404/");
  if (!legal404 || !existsSync(legal404.filePath)) return;
  const html = await fs.readFile(legal404.filePath, "utf8");
  await writeFile(path.join(ROOT, "404.html"), html);

  const pt404 = routeFilesByRoute.get("/pt-br/legal/404/");
  if (pt404 && existsSync(pt404.filePath)) {
    const ptHtml = await fs.readFile(pt404.filePath, "utf8");
    await writeFile(path.join(ROOT, "pt-br", "404.html"), ptHtml);
  }
}

async function main() {
  const routeFiles = await discoverRouteFiles(ROOT, { includePt: true });
  const normalization = await normalizeRouteHtmlFiles(ROOT, routeFiles);
  const lastmodByFile = await resolveLastmodByFile(
    ROOT,
    routeFiles.map((page) => page.filePath)
  );
  const routeFilesByRoute = new Map(routeFiles.map((item) => [item.route, item]));
  const localeBuckets = {
    en: { searchIndex: [], buildReport: [], formMap: [] },
    "pt-br": { searchIndex: [], buildReport: [], formMap: [] }
  };
  const sitemapEntries = [];

  for (const page of routeFiles) {
    const html = await fs.readFile(page.filePath, "utf8");
    const pageData = extractPageData(page.route, html);
    const locale = localeForRoute(page.route);
    const bucket = localeBuckets[locale];

    if (!pageData.noindex) {
      bucket.searchIndex.push(pageData);
    }

    bucket.buildReport.push({
      route: page.route,
      title: pageData.title,
      wordCount: mainContentWordCount(html)
    });

    const formActions = extractFormActions(html).filter((action) => /formspree\.io\/f\//i.test(action));
    for (const endpoint of formActions) {
      bucket.formMap.push(buildFormMapEntry(page.route, pageData.title, endpoint));
    }

    sitemapEntries.push({
      route: page.route,
      noindex: pageData.noindex,
      lastmod: lastmodByFile.get(path.resolve(page.filePath)) || ""
    });
  }

  await sync404(routeFilesByRoute);
  for (const [locale, bucket] of Object.entries(localeBuckets)) {
    const dataRoot = locale === "pt-br" ? path.join(ROOT, "pt-br", "data") : path.join(ROOT, "data");
    await writeFile(path.join(dataRoot, "search-index.json"), JSON.stringify(bucket.searchIndex, null, 2));
    await writeFile(path.join(dataRoot, "build-report.json"), JSON.stringify(bucket.buildReport, null, 2));
    await writeFile(path.join(dataRoot, "formspree-map.json"), JSON.stringify(bucket.formMap, null, 2));
  }

  await writeFile(path.join(ROOT, "docs", "formspree-map.md"), buildFormMapMarkdown(localeBuckets.en.formMap));
  const sitemapArtifacts = buildSitemapArtifacts(sitemapEntries);
  for (const file of sitemapArtifacts.files) {
    await writeFile(path.join(ROOT, file.path), file.content);
  }

  const enSearchCount = localeBuckets.en.searchIndex.length;
  const ptSearchCount = localeBuckets["pt-br"].searchIndex.length;
  console.log(
    `Synced static site data for ${routeFiles.length} HTML routes (${enSearchCount} EN search entries, ${ptSearchCount} PT search entries, ${normalization.changed} normalized HTML routes).`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
