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
const SITE_DOMAIN = "https://immigratetobrazil.com";

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

function localeForRoute(route) {
  return route.startsWith("/pt-br/") ? "pt-br" : "en";
}

function absoluteUrl(route) {
  return route === "/" ? SITE_DOMAIN : `${SITE_DOMAIN}${route}`;
}

function baseRouteFor(route) {
  return route.startsWith("/pt-br/") ? route.replace(/^\/pt-br/, "") || "/" : route;
}

function changeFreq(route) {
  return route === "/" || route === "/pt-br/" ? "weekly" : "weekly";
}

function priority(route) {
  if (route === "/") return "1.0";
  if (route === "/pt-br/") return "0.9";
  return "0.8";
}

function buildSitemap(routeEntries) {
  const routeGroups = new Map();
  for (const entry of routeEntries) {
    if (entry.noindex) continue;
    const baseRoute = baseRouteFor(entry.route);
    const group = routeGroups.get(baseRoute) || {};
    group[localeForRoute(entry.route)] = entry.route;
    routeGroups.set(baseRoute, group);
  }

  const urls = routeEntries
    .filter((entry) => !entry.noindex)
    .map((entry) => {
      const group = routeGroups.get(baseRouteFor(entry.route)) || {};
      const enRoute = group.en || baseRouteFor(entry.route);
      const ptRoute = group["pt-br"];
      const alternates = [
        `<xhtml:link rel="alternate" hreflang="en" href="${absoluteUrl(enRoute)}" />`,
        ptRoute ? `<xhtml:link rel="alternate" hreflang="pt-BR" href="${absoluteUrl(ptRoute)}" />` : "",
        `<xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(enRoute)}" />`
      ]
        .filter(Boolean)
        .join("");

      return `<url><loc>${absoluteUrl(entry.route)}</loc>${alternates}<changefreq>${changeFreq(entry.route)}</changefreq><priority>${priority(entry.route)}</priority></url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>\n`;
}

function buildRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_DOMAIN}/sitemap.xml\n`;
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

    sitemapEntries.push({ route: page.route, noindex: pageData.noindex });
  }

  await sync404(routeFilesByRoute);
  for (const [locale, bucket] of Object.entries(localeBuckets)) {
    const dataRoot = locale === "pt-br" ? path.join(ROOT, "pt-br", "data") : path.join(ROOT, "data");
    await writeFile(path.join(dataRoot, "search-index.json"), JSON.stringify(bucket.searchIndex, null, 2));
    await writeFile(path.join(dataRoot, "build-report.json"), JSON.stringify(bucket.buildReport, null, 2));
    await writeFile(path.join(dataRoot, "formspree-map.json"), JSON.stringify(bucket.formMap, null, 2));
  }

  await writeFile(path.join(ROOT, "docs", "formspree-map.md"), buildFormMapMarkdown(localeBuckets.en.formMap));
  await writeFile(path.join(ROOT, "sitemap.xml"), buildSitemap(sitemapEntries));
  await writeFile(path.join(ROOT, "robots.txt"), buildRobots());

  const enSearchCount = localeBuckets.en.searchIndex.length;
  const ptSearchCount = localeBuckets["pt-br"].searchIndex.length;
  console.log(
    `Synced static site data for ${routeFiles.length} HTML routes (${enSearchCount} EN search entries, ${ptSearchCount} PT search entries).`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
