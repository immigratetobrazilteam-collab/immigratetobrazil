import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  discoverRouteFiles,
  extractLocalRefs,
  extractPageData,
  normalizeUrlForLookup,
  resolveLocalPath
} from "./static-site-utils.js";
import { buildRouteGroups, expectedAlternateLinks } from "./html-normalize-utils.js";
import { absoluteUrl, baseRouteFor, localeForRoute } from "./sitemap-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CANONICAL_RE = /<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/gi;
const ALTERNATE_RE =
  /<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhreflang=["']([^"']+)["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/gi;
const ROBOTS_RE = /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["']([^"']+)["'])[^>]*>/i;
const LOC_RE = /<loc>([^<]+)<\/loc>/gi;
const ROOT_NOINDEX_SEGMENTS = new Set(["search", "404"]);

function localeDataPath(locale, fileName) {
  return locale === "pt-br" ? path.join(ROOT, "pt-br", "data", fileName) : path.join(ROOT, "data", fileName);
}

function extractCanonicals(html) {
  return [...html.matchAll(CANONICAL_RE)].map((match) => match[1]);
}

function extractAlternates(html) {
  return [...html.matchAll(ALTERNATE_RE)].map((match) => ({
    hreflang: match[1],
    href: match[2]
  }));
}

function shouldBeNoindex(route) {
  const segments = route.split("/").filter(Boolean);
  return segments.some((segment) => ROOT_NOINDEX_SEGMENTS.has(segment));
}

function routesFromSitemap(xml) {
  const routes = [];
  for (const match of xml.matchAll(LOC_RE)) {
    try {
      routes.push(new URL(match[1]).pathname || "/");
    } catch {
      routes.push(match[1]);
    }
  }
  return routes.sort();
}

function compareStringSets(actual, expected) {
  if (actual.length !== expected.length) return false;
  return actual.every((value, index) => value === expected[index]);
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
  const routeFiles = await discoverRouteFiles(ROOT, { includePt: true });
  const routeGroups = buildRouteGroups(routeFiles);
  const failures = [];
  const expectedSearchByLocale = { en: [], "pt-br": [] };
  const expectedSitemapRoutes = [];

  for (const entry of routeFiles) {
    const html = await fs.readFile(entry.filePath, "utf8");
    const pageData = extractPageData(entry.route, html);
    const canonicals = extractCanonicals(html);
    const alternates = extractAlternates(html);
    const robotsMatch = html.match(ROBOTS_RE);
    const expectedAlternates = expectedAlternateLinks(entry.route, routeGroups);
    const alternateCountByLang = new Map();

    if (canonicals.length !== 1 || canonicals[0] !== absoluteUrl(entry.route)) {
      failures.push(`Canonical mismatch on ${entry.route}`);
    }

    for (const alternate of alternates) {
      alternateCountByLang.set(alternate.hreflang, (alternateCountByLang.get(alternate.hreflang) || 0) + 1);
    }

    for (const expected of expectedAlternates) {
      const matches = alternates.filter(
        (alternate) => alternate.hreflang === expected.hreflang && alternate.href === expected.href
      );
      if (matches.length !== 1) {
        failures.push(`Alternate mismatch on ${entry.route} for hreflang ${expected.hreflang}`);
      }
    }

    for (const [hreflang, count] of alternateCountByLang.entries()) {
      if (count > 1) {
        failures.push(`Duplicate alternate hreflang ${hreflang} on ${entry.route}`);
      }
    }

    if (!robotsMatch) {
      failures.push(`Missing robots meta on ${entry.route}`);
    } else {
      const robotsValue = robotsMatch[1].toLowerCase();
      const isNoindex = robotsValue.includes("noindex");
      if (isNoindex !== pageData.noindex) {
        failures.push(`Robots meta does not match derived indexability on ${entry.route}`);
      }
    }

    if (shouldBeNoindex(entry.route) && !pageData.noindex) {
      failures.push(`Expected noindex on ${entry.route}`);
    }

    for (const ref of extractLocalRefs(html)) {
      const lookupPath = normalizeUrlForLookup(ref, entry.route);
      if (!lookupPath) continue;
      const localPath = resolveLocalPath(ROOT, lookupPath);
      if (localPath && !existsSync(localPath)) {
        failures.push(`Broken local reference ${ref} on ${entry.route}`);
      }
    }

    if (!pageData.noindex) {
      expectedSearchByLocale[localeForRoute(entry.route)].push(entry.route);
      expectedSitemapRoutes.push(entry.route);
    }
  }

  for (const locale of Object.keys(expectedSearchByLocale)) {
    const searchIndex = await readJson(localeDataPath(locale, "search-index.json"), failures);
    if (!searchIndex) continue;

    const actualRoutes = [...new Set(searchIndex.map((item) => item.route))].sort();
    const expectedRoutes = [...new Set(expectedSearchByLocale[locale])].sort();
    if (!compareStringSets(actualRoutes, expectedRoutes)) {
      failures.push(`Search index is out of sync for ${locale}`);
    }
  }

  const sitemapPath = path.join(ROOT, "sitemap.xml");
  if (!existsSync(sitemapPath)) {
    failures.push("Missing sitemap.xml");
  } else {
    const sitemapXml = await fs.readFile(sitemapPath, "utf8");
    const actualRoutes = routesFromSitemap(sitemapXml);
    const expectedRoutes = [...new Set(expectedSitemapRoutes)].sort();
    if (!compareStringSets(actualRoutes, expectedRoutes)) {
      failures.push("Sitemap routes are out of sync");
    }
  }

  const robotsPath = path.join(ROOT, "robots.txt");
  if (!existsSync(robotsPath)) {
    failures.push("Missing robots.txt");
  } else {
    const robotsTxt = await fs.readFile(robotsPath, "utf8");
    if (!robotsTxt.includes("Sitemap: https://immigratetobrazil.com/sitemap.xml")) {
      failures.push("robots.txt is missing the sitemap directive");
    }
  }

  if (failures.length) {
    console.error("SEO audit failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  const summary = {
    indexedRoutes: expectedSitemapRoutes.length,
    routePairs: new Set(routeFiles.map((entry) => baseRouteFor(entry.route))).size,
    englishSearchEntries: expectedSearchByLocale.en.length,
    portugueseSearchEntries: expectedSearchByLocale["pt-br"].length
  };

  console.log(`SEO audit passed: ${JSON.stringify(summary)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
