import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { decodeHtml, discoverRouteFiles, stripHtml } from "./static-site-utils.js";
import {
  absoluteHeroUrl,
  baseRouteFor,
  buildHeroAssignments,
  buildHeroMetadata
} from "./hero-seo-utils.js";
import { syncHeroAssets } from "./fetch-pixabay-images.js";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const SITE_DOMAIN = "https://immigratetobrazil.com";
const MANIFEST_PATH = path.join(ROOT, "data", "hero-manifest.json");
const ROOT_404_PATH = path.join(ROOT, "404.html");
const LD_JSON_RE = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i;
const ITB_SITE_RE = /window\.ITB_SITE\s*=\s*(\{.*?\});/s;
const TITLE_RE = /<title>([\s\S]*?)<\/title>/i;
const H1_RE = /<h1[^>]*>([\s\S]*?)<\/h1>/i;

function htmlEscape(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function pageUrlForRoute(route) {
  return route === "/" ? SITE_DOMAIN : `${SITE_DOMAIN}${route}`;
}

function readJson(filePath) {
  return fs.readFile(filePath, "utf8").then((value) => JSON.parse(value));
}

async function writeJson(filePath, payload) {
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function normalizeManifestEntry(entry) {
  const { folder, ...rest } = entry;
  return rest;
}

function detectLocale(html, route) {
  if (route.startsWith("/pt-br/")) return "pt-BR";
  return /<html[^>]*lang=["']pt-BR["']/i.test(html) ? "pt-BR" : "en";
}

function extractPageTitle(html) {
  const siteMatch = html.match(ITB_SITE_RE);
  if (siteMatch) {
    try {
      const siteConfig = JSON.parse(siteMatch[1]);
      if (siteConfig.pageTitle) {
        return siteConfig.pageTitle;
      }
    } catch {
      // Fall back to HTML parsing below.
    }
  }

  const h1Match = html.match(H1_RE);
  if (h1Match) {
    return decodeHtml(stripHtml(h1Match[1]));
  }

  const titleMatch = html.match(TITLE_RE);
  if (titleMatch) {
    return decodeHtml(stripHtml(titleMatch[1].split("|")[0]));
  }

  return "";
}

function upsertHeadTag(html, matchPattern, replacement, afterPatterns = []) {
  if (matchPattern.test(html)) {
    return html.replace(matchPattern, replacement);
  }

  for (const pattern of afterPatterns) {
    const match = html.match(pattern);
    if (match) {
      const matchedText = match[0];
      const trimmed = matchedText.replace(/\s*$/, "");
      const trailingWhitespace = matchedText.slice(trimmed.length) || "\n    ";
      return html.replace(pattern, `${trimmed}\n    ${replacement}${trailingWhitespace}`);
    }
  }

  return html.replace(/<\/head>/i, `    ${replacement}\n</head>`);
}

function updateJsonLd(html, hero, route, locale) {
  const match = html.match(LD_JSON_RE);
  if (!match) return html;

  let payload;
  try {
    payload = JSON.parse(match[1]);
  } catch {
    return html;
  }

  const pageUrl = pageUrlForRoute(route);
  const heroUrl = absoluteHeroUrl(hero.path);
  const filtered = Array.isArray(payload)
    ? payload.filter((item) => item?.["@type"] !== "ImageObject")
    : [payload].filter((item) => item?.["@type"] !== "ImageObject");

  filtered.push({
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": `${pageUrl}#hero-image`,
    name: hero.imageTitle,
    description: hero.description,
    caption: hero.alt,
    keywords: hero.keywords.join(", "),
    contentUrl: heroUrl,
    url: heroUrl,
    thumbnailUrl: heroUrl,
    representativeOfPage: true,
    inLanguage: locale
  });

  return html.replace(LD_JSON_RE, `<script type="application/ld+json">${JSON.stringify(filtered)}</script>`);
}

function updateHeroMarkup(html, hero) {
  const heroMediaTag = `  <img class="hero-media" src="${htmlEscape(hero.path)}" alt="${htmlEscape(hero.alt)}" width="1600" height="900" loading="eager" fetchpriority="high" decoding="async" />`;
  html = html.replace(/\n?[ \t]*<img class="hero-media"[^>]*>\n?/i, "\n");

  return html.replace(
    /(^[ \t]*)<header class="hero"[^>]*style="--hero-image:url\('[^']+'\)"[^>]*>/m,
    (fullMatch, indent) =>
      `${indent}<header class="hero" style="--hero-image:url('${hero.path}')">\n${indent}${heroMediaTag}`
  );
}

function rewritePageHtml(html, route, assignment) {
  const locale = detectLocale(html, route);
  const pageTitle = extractPageTitle(html) || assignment.title;
  const hero = {
    ...assignment,
    ...buildHeroMetadata(assignment, { locale, title: pageTitle })
  };
  const preloadTag = `<link rel="preload" as="image" href="${htmlEscape(hero.path)}" fetchpriority="high" />`;
  const ogImageTag = `<meta property="og:image" content="${htmlEscape(absoluteHeroUrl(hero.path))}" />`;
  const ogImageAltTag = `<meta property="og:image:alt" content="${htmlEscape(hero.alt)}" />`;
  const twitterImageTag = `<meta name="twitter:image" content="${htmlEscape(absoluteHeroUrl(hero.path))}" />`;
  const twitterImageAltTag = `<meta name="twitter:image:alt" content="${htmlEscape(hero.alt)}" />`;

  let nextHtml = html;
  nextHtml = upsertHeadTag(
    nextHtml,
    /<link\b(?=[^>]*\brel=["']preload["'])(?=[^>]*\bas=["']image["'])[^>]*>/i,
    preloadTag,
    [
      /<link\b[^>]*hreflang=["']x-default["'][^>]*>\s*/i,
      /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/i
    ]
  );
  nextHtml = upsertHeadTag(
    nextHtml,
    /<meta\b(?=[^>]*\bproperty=["']og:image["'])[^>]*>/i,
    ogImageTag,
    [/<meta\b(?=[^>]*\bproperty=["']og:url["'])[^>]*>\s*/i]
  );
  nextHtml = upsertHeadTag(
    nextHtml,
    /<meta\b(?=[^>]*\bproperty=["']og:image:alt["'])[^>]*>/i,
    ogImageAltTag,
    [/<meta\b(?=[^>]*\bproperty=["']og:image["'])[^>]*>\s*/i]
  );
  nextHtml = upsertHeadTag(
    nextHtml,
    /<meta\b(?=[^>]*\bname=["']twitter:image["'])[^>]*>/i,
    twitterImageTag,
    [/<meta\b(?=[^>]*\bname=["']twitter:description["'])[^>]*>\s*/i]
  );
  nextHtml = upsertHeadTag(
    nextHtml,
    /<meta\b(?=[^>]*\bname=["']twitter:image:alt["'])[^>]*>/i,
    twitterImageAltTag,
    [/<meta\b(?=[^>]*\bname=["']twitter:image["'])[^>]*>\s*/i]
  );
  nextHtml = updateJsonLd(nextHtml, hero, route, locale);
  nextHtml = updateHeroMarkup(nextHtml, hero);

  return nextHtml;
}

async function rewriteRouteFile(filePath, route, assignment) {
  const original = await fs.readFile(filePath, "utf8");
  const updated = rewritePageHtml(original, route, assignment);
  if (updated !== original) {
    await fs.writeFile(filePath, updated, "utf8");
  }
}

export async function rewriteHeroSeo() {
  const manifest = await readJson(MANIFEST_PATH);
  const assignments = buildHeroAssignments(manifest);
  const assignmentByRoute = new Map(assignments.map((item) => [item.route, item]));

  await writeJson(MANIFEST_PATH, assignments.map(normalizeManifestEntry));
  await syncHeroAssets({
    refresh: false,
    manifest,
    previousManifest: manifest,
    assignments
  });

  const routeFiles = await discoverRouteFiles(ROOT, { includePt: true });
  for (const { route, filePath } of routeFiles) {
    const assignment = assignmentByRoute.get(baseRouteFor(route));
    if (!assignment) continue;
    await rewriteRouteFile(filePath, route, assignment);
  }

  const legal404 = assignmentByRoute.get("/legal/404/");
  if (legal404) {
    await rewriteRouteFile(ROOT_404_PATH, "/legal/404/", legal404);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  rewriteHeroSeo().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
