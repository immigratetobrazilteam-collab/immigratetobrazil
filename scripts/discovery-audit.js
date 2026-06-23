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
import {
  absoluteUrl,
  baseRouteFor,
  childSitemapRoute,
  localeForRoute,
  sitemapGroupForRoute
} from "./sitemap-utils.js";
import { buildRouteGroups, expectedAlternateLinks } from "./html-normalize-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITE_ORIGIN = "https://immigratetobrazil.com";
const TODAY = new Date().toISOString().slice(0, 10);

const CANONICAL_RE = /<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/gi;
const ROBOTS_META_RE = /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["']([^"']+)["'])[^>]*>/i;
const JSON_LD_RE = /<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
const ANCHOR_HREF_RE = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
const XML_LOC_RE = /<loc>([^<]+)<\/loc>/gi;
const SITEMAP_ENTRY_RE = /<sitemap>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/sitemap>/gi;
const URL_ENTRY_RE = /<url>[\s\S]*?<loc>([^<]+)<\/loc>([\s\S]*?)<\/url>/gi;
const LASTMOD_RE = /<lastmod>([^<]+)<\/lastmod>/i;
const XHTML_LINK_RE =
  /<xhtml:link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhreflang=["']([^"']+)["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*\/?>/gi;

const REQUIRED_KEY_ROUTES = [
  "/",
  "/about/",
  "/about/lawyer/",
  "/services/",
  "/services/visas/",
  "/services/residencies/",
  "/services/naturalisation/",
  "/services/defense/",
  "/services/advisory/consultation/",
  "/process/",
  "/brazil/",
  "/countries/",
  "/insights/",
  "/insights/guides/",
  "/start-consultation/",
  "/contact/",
  "/pt-br/",
  "/pt-br/services/",
  "/pt-br/start-consultation/",
  "/pt-br/contact/"
];

const REQUIRED_LLMS_PHRASES = [
  "## Core Services",
  "## Consultation Pages",
  "## Guides And Resources",
  "## Country And Regional Pages",
  "https://immigratetobrazil.com/services/",
  "https://immigratetobrazil.com/start-consultation/",
  "https://immigratetobrazil.com/countries/",
  "https://immigratetobrazil.com/data/ai-route-manifest.json"
];

const REQUIRED_GLOBAL_HEADERS = [
  "cache-control",
  "content-security-policy",
  "referrer-policy",
  "strict-transport-security",
  "x-content-type-options"
];

const REQUIRED_HEADER_PATHS = new Map([
  ["/robots.txt", ["content-type", "cache-control"]],
  ["/llms.txt", ["content-type", "cache-control"]],
  ["/sitemap.xml", ["content-type", "cache-control"]],
  ["/sitemaps/*", ["content-type", "cache-control"]],
  ["/data/ai-route-manifest.json", ["content-type", "cache-control"]]
]);

function routeFromUrl(value) {
  try {
    const url = new URL(value);
    return url.pathname || "/";
  } catch {
    return null;
  }
}

function extractCanonicals(html) {
  return [...html.matchAll(CANONICAL_RE)].map((match) => match[1]);
}

function normalizeHeaderName(value = "") {
  return value.toLowerCase();
}

function parseHeadersFile(text) {
  const rules = [];
  let current = null;

  for (const rawLine of text.split(/\r?\n/)) {
    if (!rawLine.trim()) continue;
    if (!rawLine.startsWith(" ") && !rawLine.startsWith("\t")) {
      current = { path: rawLine.trim(), headers: new Map(), removed: new Set() };
      rules.push(current);
      continue;
    }

    if (!current) continue;
    const line = rawLine.trim();
    if (line.startsWith("!")) {
      current.removed.add(normalizeHeaderName(line.slice(1).trim()));
      continue;
    }

    const separator = line.indexOf(":");
    if (separator === -1) continue;
    current.headers.set(normalizeHeaderName(line.slice(0, separator).trim()), line.slice(separator + 1).trim());
  }

  return rules;
}

function stripRobotsComment(line) {
  const index = line.indexOf("#");
  return (index === -1 ? line : line.slice(0, index)).trim();
}

function parseRobots(text) {
  const groups = [];
  let current = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = stripRobotsComment(rawLine);
    if (!line) {
      current = null;
      continue;
    }

    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === "user-agent") {
      if (!current || current.rules.length) {
        current = { agents: [], rules: [], sitemaps: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      continue;
    }

    if (field === "sitemap") {
      if (!current) {
        current = { agents: [], rules: [], sitemaps: [] };
        groups.push(current);
      }
      current.sitemaps.push(value);
      continue;
    }

    if ((field === "allow" || field === "disallow") && current) {
      current.rules.push({ type: field, path: value });
    }
  }

  return groups;
}

function robotsGroupFor(groups, userAgent) {
  const agent = userAgent.toLowerCase();
  let best = null;
  let bestLength = -1;

  for (const group of groups) {
    for (const token of group.agents) {
      const matches = token === "*" || agent.includes(token);
      if (!matches) continue;
      if (token.length > bestLength) {
        best = group;
        bestLength = token.length;
      }
    }
  }

  return best;
}

function isAllowedByRobots(groups, pathname, userAgent = "Googlebot") {
  const group = robotsGroupFor(groups, userAgent);
  if (!group) return true;

  let bestRule = null;
  for (const rule of group.rules) {
    if (!rule.path) {
      if (rule.type === "disallow" && !bestRule) bestRule = { ...rule, length: 0 };
      continue;
    }
    if (!pathname.startsWith(rule.path)) continue;
    const length = rule.path.length;
    if (!bestRule || length > bestRule.length || (length === bestRule.length && rule.type === "allow")) {
      bestRule = { ...rule, length };
    }
  }

  return bestRule?.type !== "disallow";
}

function parseUrlSitemap(xml) {
  return [...xml.matchAll(URL_ENTRY_RE)].map((match) => {
    const loc = match[1].trim();
    const body = match[2];
    const lastmod = body.match(LASTMOD_RE)?.[1]?.trim() || "";
    const alternates = [...body.matchAll(XHTML_LINK_RE)].map((alternate) => ({
      hreflang: alternate[1],
      href: alternate[2]
    }));
    return { loc, route: routeFromUrl(loc), lastmod, alternates };
  });
}

function isLikelyXml(text, rootElement) {
  return text.startsWith("<?xml") && text.includes(`<${rootElement}`) && text.includes(`</${rootElement}>`);
}

function validateJsonLd(route, html, failures) {
  const matches = [...html.matchAll(JSON_LD_RE)];
  if (!matches.length) {
    failures.push(`Missing JSON-LD schema on ${route}`);
    return;
  }

  for (const match of matches) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      failures.push(`Invalid JSON-LD on ${route}: ${error.message}`);
    }
  }
}

function addLink(edges, from, to, routeSet) {
  if (!routeSet.has(to)) return;
  const list = edges.get(from) || new Set();
  list.add(to);
  edges.set(from, list);
}

function shortestDistances(edges, start) {
  const distances = new Map([[start, 0]]);
  const queue = [start];

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    const distance = distances.get(current);
    for (const next of edges.get(current) || []) {
      if (distances.has(next)) continue;
      distances.set(next, distance + 1);
      queue.push(next);
    }
  }

  return distances;
}

async function main() {
  const failures = [];
  const warnings = [];
  const routeFiles = await discoverRouteFiles(ROOT, { includePt: true });
  const routeGroups = buildRouteGroups(routeFiles);
  const pageDataByRoute = new Map();
  const fileByRoute = new Map(routeFiles.map((entry) => [entry.route, entry.filePath]));
  const indexableRoutes = [];

  for (const entry of routeFiles) {
    const html = await fs.readFile(entry.filePath, "utf8");
    const pageData = extractPageData(entry.route, html);
    pageDataByRoute.set(entry.route, pageData);

    const canonicals = extractCanonicals(html);
    if (canonicals.length !== 1 || canonicals[0] !== absoluteUrl(entry.route)) {
      failures.push(`Canonical mismatch on ${entry.route}`);
    }

    const robotsValue = html.match(ROBOTS_META_RE)?.[1]?.toLowerCase() || "";
    if (!robotsValue) failures.push(`Missing meta robots on ${entry.route}`);
    if (robotsValue.includes("noindex") !== pageData.noindex) {
      failures.push(`Conflicting meta robots/noindex signal on ${entry.route}`);
    }

    validateJsonLd(entry.route, html, failures);
    if (!pageData.noindex) indexableRoutes.push(entry.route);
  }

  const indexableRouteSet = new Set(indexableRoutes);
  const sitemapIndexPath = path.join(ROOT, "sitemap.xml");
  if (!existsSync(sitemapIndexPath)) {
    failures.push("Missing sitemap.xml");
  } else {
    const sitemapIndexXml = await fs.readFile(sitemapIndexPath, "utf8");
    if (!isLikelyXml(sitemapIndexXml, "sitemapindex")) failures.push("sitemap.xml is not a valid-looking sitemap index");

    const childLocs = [...sitemapIndexXml.matchAll(SITEMAP_ENTRY_RE)].map((match) => match[1].trim());
    const expectedChildRoutes = [
      ...new Set(indexableRoutes.map((route) => childSitemapRoute(sitemapGroupForRoute(route))))
    ].sort();
    const actualChildRoutes = childLocs.map(routeFromUrl).sort();

    if (new Set(childLocs).size !== childLocs.length) failures.push("Duplicate child sitemap URLs in sitemap.xml");
    if (JSON.stringify(actualChildRoutes) !== JSON.stringify(expectedChildRoutes)) {
      failures.push("sitemap.xml child sitemap routes do not match indexable sections");
    }

    const sitemapRoutes = [];
    const seenSitemapUrls = new Set();
    for (const childRoute of actualChildRoutes) {
      const childPath = path.join(ROOT, childRoute.replace(/^\//, ""));
      if (!existsSync(childPath)) {
        failures.push(`Missing child sitemap ${childRoute}`);
        continue;
      }

      const childXml = await fs.readFile(childPath, "utf8");
      if (!isLikelyXml(childXml, "urlset")) failures.push(`${childRoute} is not a valid-looking URL sitemap`);
      const entries = parseUrlSitemap(childXml);

      if (entries.length > 50000) failures.push(`${childRoute} exceeds 50,000 URL entries`);
      const stats = await fs.stat(childPath);
      if (stats.size > 50 * 1024 * 1024) failures.push(`${childRoute} exceeds 50MB`);

      for (const entry of entries) {
        if (!entry.loc.startsWith(`${SITE_ORIGIN}/`) && entry.loc !== SITE_ORIGIN) {
          failures.push(`Off-domain sitemap URL: ${entry.loc}`);
        }
        if (!entry.route || !indexableRouteSet.has(entry.route)) {
          failures.push(`Sitemap URL is not an indexable local route: ${entry.loc}`);
          continue;
        }
        if (seenSitemapUrls.has(entry.loc)) failures.push(`Duplicate sitemap URL: ${entry.loc}`);
        seenSitemapUrls.add(entry.loc);
        sitemapRoutes.push(entry.route);

        if (entry.lastmod && !/^\d{4}-\d{2}-\d{2}$/.test(entry.lastmod)) {
          failures.push(`Invalid lastmod format for ${entry.loc}: ${entry.lastmod}`);
        }
        if (entry.lastmod && entry.lastmod > TODAY) {
          failures.push(`Future lastmod for ${entry.loc}: ${entry.lastmod}`);
        }

        const localPath = resolveLocalPath(ROOT, entry.route);
        if (!localPath || !existsSync(localPath)) failures.push(`Sitemap URL would not return local 200: ${entry.loc}`);

        const html = await fs.readFile(fileByRoute.get(entry.route), "utf8");
        const canonicals = extractCanonicals(html);
        if (canonicals[0] !== entry.loc) failures.push(`Sitemap URL is not canonical for ${entry.route}`);

        const expectedAlternates = expectedAlternateLinks(entry.route, routeGroups);
        for (const expected of expectedAlternates) {
          const match = entry.alternates.some(
            (alternate) => alternate.hreflang === expected.hreflang && alternate.href === expected.href
          );
          if (!match) failures.push(`Sitemap missing hreflang ${expected.hreflang} for ${entry.route}`);
        }
      }
    }

    const uniqueSitemapRoutes = [...new Set(sitemapRoutes)].sort();
    const expectedRoutes = [...indexableRouteSet].sort();
    if (JSON.stringify(uniqueSitemapRoutes) !== JSON.stringify(expectedRoutes)) {
      failures.push("Sitemap URL set does not exactly match indexable route set");
    }
  }

  const robotsPath = path.join(ROOT, "robots.txt");
  if (!existsSync(robotsPath)) {
    failures.push("Missing robots.txt");
  } else {
    const robotsTxt = await fs.readFile(robotsPath, "utf8");
    const groups = parseRobots(robotsTxt);
    const allSitemaps = groups.flatMap((group) => group.sitemaps);
    if (!allSitemaps.includes(`${SITE_ORIGIN}/sitemap.xml`)) failures.push("robots.txt is missing sitemap.xml");

    const agents = ["Googlebot", "Bingbot", "OAI-SearchBot", "GPTBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "CCBot", "Google-Extended"];
    for (const agent of agents) {
      for (const route of REQUIRED_KEY_ROUTES) {
        if (indexableRouteSet.has(route) && !isAllowedByRobots(groups, route, agent)) {
          failures.push(`robots.txt blocks key route ${route} for ${agent}`);
        }
      }
    }
  }

  const llmsPath = path.join(ROOT, "llms.txt");
  if (!existsSync(llmsPath)) {
    failures.push("Missing llms.txt");
  } else {
    const llms = await fs.readFile(llmsPath, "utf8");
    if (!llms.startsWith("# Immigrate to Brazil")) failures.push("llms.txt must start with the site H1");
    for (const phrase of REQUIRED_LLMS_PHRASES) {
      if (!llms.includes(phrase)) failures.push(`llms.txt missing required discovery item: ${phrase}`);
    }
  }

  const headersPath = path.join(ROOT, "_headers");
  if (!existsSync(headersPath)) {
    failures.push("Missing _headers");
  } else {
    const headerRules = parseHeadersFile(await fs.readFile(headersPath, "utf8"));
    const globalRule = headerRules.find((rule) => rule.path === "/*");
    if (!globalRule) {
      failures.push("_headers is missing a global /* rule");
    } else {
      for (const header of REQUIRED_GLOBAL_HEADERS) {
        if (!globalRule.headers.has(header)) failures.push(`_headers global rule missing ${header}`);
      }
      if (globalRule.headers.has("x-robots-tag")) {
        failures.push("_headers must not set a global X-Robots-Tag");
      }
    }

    for (const [route, requiredHeaders] of REQUIRED_HEADER_PATHS.entries()) {
      const rule = headerRules.find((item) => item.path === route);
      if (!rule) {
        failures.push(`_headers missing ${route} rule`);
        continue;
      }
      for (const header of requiredHeaders) {
        if (!rule.headers.has(header)) failures.push(`_headers ${route} rule missing ${header}`);
      }
    }

    if (!headerRules.some((rule) => rule.headers.has("x-robots-tag"))) {
      warnings.push("_headers has no scoped X-Robots-Tag; this is acceptable when HTML meta robots are authoritative");
    }
    warnings.push("Last-Modified and ETag are host-generated on Cloudflare Pages and are not configured in _headers.");
  }

  const manifestPath = path.join(ROOT, "data", "ai-route-manifest.json");
  if (!existsSync(manifestPath)) {
    failures.push("Missing data/ai-route-manifest.json");
  } else {
    try {
      const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
      if (!manifest.site?.sitemap || !manifest.site?.llmsTxt) failures.push("AI route manifest missing discovery file pointers");
      if (!Array.isArray(manifest.keyRoutes) || manifest.keyRoutes.length < 20) {
        failures.push("AI route manifest has too few key routes");
      }
    } catch (error) {
      failures.push(`Invalid AI route manifest JSON: ${error.message}`);
    }
  }

  const routeSet = new Set(indexableRoutes);
  routeSet.add("/sitemap.html");
  const edges = new Map();

  for (const entry of routeFiles) {
    if (!indexableRouteSet.has(entry.route)) continue;
    const html = await fs.readFile(entry.filePath, "utf8");
    for (const match of html.matchAll(ANCHOR_HREF_RE)) {
      const lookup = normalizeUrlForLookup(match[1], entry.route);
      if (!lookup) continue;
      addLink(edges, entry.route, lookup, routeSet);
    }

    for (const ref of extractLocalRefs(html)) {
      const lookup = normalizeUrlForLookup(ref, entry.route);
      if (!lookup) continue;
      const localPath = resolveLocalPath(ROOT, lookup);
      if (localPath && !existsSync(localPath)) failures.push(`Broken local reference ${ref} on ${entry.route}`);
    }
  }

  const sitemapHtmlPath = path.join(ROOT, "sitemap.html");
  if (existsSync(sitemapHtmlPath)) {
    const html = await fs.readFile(sitemapHtmlPath, "utf8");
    if (!html.includes('<meta name="robots" content="index,follow"')) {
      failures.push("sitemap.html should be indexable");
    }
    for (const match of html.matchAll(ANCHOR_HREF_RE)) {
      const lookup = normalizeUrlForLookup(match[1], "/sitemap.html");
      if (!lookup) continue;
      addLink(edges, "/sitemap.html", lookup, routeSet);
    }
  } else {
    failures.push("Missing sitemap.html");
  }

  const distances = shortestDistances(edges, "/");
  if (!distances.has("/sitemap.html")) {
    failures.push("sitemap.html is not statically linked from the home page");
  }

  for (const route of REQUIRED_KEY_ROUTES) {
    if (!indexableRouteSet.has(route)) {
      failures.push(`Required key route missing or noindex: ${route}`);
      continue;
    }
    const distance = distances.get(route);
    if (distance === undefined || distance > 3) {
      failures.push(`Key route is not reachable within three static clicks from home: ${route}`);
    }
  }

  const unreachable = indexableRoutes.filter((route) => !distances.has(route));
  if (unreachable.length) {
    failures.push(`${unreachable.length} indexable routes are not statically reachable from home`);
  }

  const routePairCount = new Set(indexableRoutes.map(baseRouteFor)).size;
  const summary = {
    routeFiles: routeFiles.length,
    indexableRoutes: indexableRoutes.length,
    routePairs: routePairCount,
    englishRoutes: indexableRoutes.filter((route) => localeForRoute(route) === "en").length,
    portugueseRoutes: indexableRoutes.filter((route) => localeForRoute(route) === "pt-br").length,
    warnings: warnings.length
  };

  if (failures.length) {
    console.error("Discovery audit failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    if (warnings.length) {
      console.error("Warnings:");
      warnings.forEach((warning) => console.error(`- ${warning}`));
    }
    process.exit(1);
  }

  console.log(`Discovery audit passed: ${JSON.stringify(summary)}`);
  if (warnings.length) {
    console.log("Warnings:");
    warnings.forEach((warning) => console.log(`- ${warning}`));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
