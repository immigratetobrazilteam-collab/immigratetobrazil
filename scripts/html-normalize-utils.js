import fs from "fs/promises";

import { discoverRouteFiles } from "./static-site-utils.js";
import { absoluteUrl, baseRouteFor, localeForRoute } from "./sitemap-utils.js";

const CANONICAL_SECTION_RE =
  /<!-- Section: Canonical And Language Alternates -->[\s\S]*?(?=<!-- Section: Preloaded Assets -->)/i;
const CANONICAL_SECTION_COMMENT_RE = /\s*<!-- Section: Canonical And Language Alternates -->\s*/gi;
const CANONICAL_LINK_RE = /\s*<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi;
const ALTERNATE_LINK_RE = /\s*<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhreflang=["'][^"']+["'])[^>]*>\s*/gi;
const HEAD_CLOSE_RE = /<\/head>/i;
const ATTR_VALUE_RE = /(\b(?:href|src)=["'])([^"']+)(["'])/gi;
const CSS_URL_RE = /url\((['"]?)([^)'"]+)\1\)/gi;

function isExternalReference(value = "") {
  return (
    !value ||
    value.startsWith("/") ||
    value.startsWith("#") ||
    value.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(value)
  );
}

export function normalizeSiteAssetReference(value = "") {
  if (isExternalReference(value)) return value;
  const match = value.match(/^(?:\.\/)?(?:\.\.\/)*(assets|css|js)\/([^?#]+)([?#].*)?$/i);
  if (!match) return value;

  const [, prefix, remainder, suffix = ""] = match;
  return `/${prefix.toLowerCase()}/${remainder}${suffix}`;
}

export function buildRouteGroups(routeFiles) {
  const routeGroups = new Map();

  for (const entry of routeFiles) {
    const groupKey = baseRouteFor(entry.route);
    const group = routeGroups.get(groupKey) || {};
    group[localeForRoute(entry.route)] = entry.route;
    routeGroups.set(groupKey, group);
  }

  return routeGroups;
}

export function expectedAlternateLinks(route, routeGroups) {
  const group = routeGroups.get(baseRouteFor(route)) || {};
  const locale = localeForRoute(route);
  const enRoute = group.en || (locale === "en" ? route : null);
  const ptRoute = group["pt-br"] || (locale === "pt-br" ? route : null);
  const defaultRoute = enRoute || route;
  const alternates = [];

  if (enRoute) {
    alternates.push({ hreflang: "en", href: absoluteUrl(enRoute) });
  }
  if (ptRoute) {
    alternates.push({ hreflang: "pt-BR", href: absoluteUrl(ptRoute) });
  }
  alternates.push({ hreflang: "x-default", href: absoluteUrl(defaultRoute) });

  return alternates;
}

function buildCanonicalSection(route, routeGroups) {
  const lines = [
    `<!-- Section: Canonical And Language Alternates -->`,
    `<link rel="canonical" href="${absoluteUrl(route)}" />`,
    ...expectedAlternateLinks(route, routeGroups).map(
      ({ hreflang, href }) => `<link rel="alternate" hreflang="${hreflang}" href="${href}" />`
    ),
    ""
  ];

  return `${lines.join("\n")}\n`;
}

function normalizeCanonicalSection(html, route, routeGroups) {
  const section = buildCanonicalSection(route, routeGroups);
  if (CANONICAL_SECTION_RE.test(html)) {
    return html.replace(CANONICAL_SECTION_RE, section);
  }

  if (!HEAD_CLOSE_RE.test(html)) return html;

  const strippedHead = html
    .replace(CANONICAL_SECTION_COMMENT_RE, "\n")
    .replace(CANONICAL_LINK_RE, "\n")
    .replace(ALTERNATE_LINK_RE, "\n");

  return strippedHead.replace(HEAD_CLOSE_RE, `${section}</head>`);
}

function normalizeAttributeReferences(html) {
  return html.replace(ATTR_VALUE_RE, (match, prefix, value, suffix) => {
    const normalized = normalizeSiteAssetReference(value);
    if (normalized === value) return match;
    return `${prefix}${normalized}${suffix}`;
  });
}

function normalizeCssUrlReferences(html) {
  return html.replace(CSS_URL_RE, (match, quote, value) => {
    const normalized = normalizeSiteAssetReference(value);
    if (normalized === value) return match;
    return `url(${quote}${normalized}${quote})`;
  });
}

export function normalizeRouteHtml(html, route, routeGroups) {
  let normalized = normalizeCanonicalSection(html, route, routeGroups);
  normalized = normalizeAttributeReferences(normalized);
  normalized = normalizeCssUrlReferences(normalized);
  return normalized;
}

export async function normalizeRouteHtmlFiles(root, routeFiles = null) {
  const files = routeFiles || (await discoverRouteFiles(root, { includePt: true }));
  const routeGroups = buildRouteGroups(files);
  let changed = 0;

  for (const entry of files) {
    const html = await fs.readFile(entry.filePath, "utf8");
    const normalized = normalizeRouteHtml(html, entry.route, routeGroups);
    if (normalized === html) continue;
    await fs.writeFile(entry.filePath, normalized, "utf8");
    changed += 1;
  }

  return { changed, routeGroups, routeFiles: files };
}
